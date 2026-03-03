/* ========================================
   Pipeline JS — 파이프라인 페이지 로직
   에이전트 스텝 렌더링 + 실행 시뮬레이션
   ======================================== */

'use strict';

/* ─── 상태 ─── */
let agentsData = [];
let historyData = [];
let outputsData = [];
let currentRunIndex = 0; // 현재 선택된 실행 탭 인덱스
let isRunning = false;

/* ─── 직급 value → label/icon 변환 맵 ─── */
const RANK_MAP = {
  intern:    { label: '인턴',     icon: '🔰' },
  junior:    { label: '신입사원', icon: '🌱' },
  associate: { label: '대리',     icon: '🖥' },
  manager:   { label: '과장',     icon: '⭐' },
  lead:      { label: '팀장',     icon: '👑' },
  director:  { label: '부장',     icon: '🏆' },
};

/* ─── 초기화 ─── */
const init = async () => {
  try {
    [agentsData, historyData, outputsData] = await Promise.all([
      fetchJSON('./data/agents.json').then(d => d.agents),
      fetchJSON('./data/history.json').then(d => d.runs),
      fetchJSON('./data/outputs.json').then(d => d.outputs),
    ]);

    renderAll();
  } catch (e) {
    console.error('데이터 로드 실패:', e);
  }
};

/** JSON fetch 헬퍼 */
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch 실패: ${url}`);
  return res.json();
};

/** 전체 렌더링 */
const renderAll = () => {
  renderPipelineSteps();
  renderAgentCards();
  renderRunPanel();
};

/* ─── 파이프라인 스텝 렌더링 ─── */
const renderPipelineSteps = () => {
  const container = document.getElementById('agent-steps');
  if (!container) return;

  const state = Store.get();
  const currentRun = historyData[currentRunIndex];
  const results = currentRun ? currentRun.results : [];

  /* 각 에이전트 상태 계산 */
  const stepsHTML = agentsData.map((agent, idx) => {
    const result = results.find(r => r.agentId === agent.id);
    const status = result ? result.status : 'pending';
    const isLast = idx === agentsData.length - 1;

    return buildStepHTML(agent, status, result, isLast, state);
  }).join('');

  container.innerHTML = stepsHTML;

  /* 스텝 버튼 이벤트 바인딩 */
  container.querySelectorAll('.tag-run[data-agent]').forEach(btn => {
    btn.addEventListener('click', () => simulateRun(btn.dataset.agent));
  });

  container.querySelectorAll('.tag-edit[data-agent]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `./pages/prompts.html?agent=${btn.dataset.agent}`;
    });
  });
};

/** 단일 스텝 HTML 빌드 */
const buildStepHTML = (agent, status, result, isLast, state) => {
  const accentColor = `var(${agent.accentVar})`;
  const glowColor = `var(${agent.glowVar})`;

  /* 오버라이드 값 읽기 (모델 + 직급) */
  const override = state.agentOverrides[agent.id];
  const modelName = (override && override.model) ? override.model : agent.model;

  /* 직급: 오버라이드 우선, 없으면 JSON 원본 사용 */
  const rankData = (override && override.rank && RANK_MAP[override.rank])
    ? RANK_MAP[override.rank]
    : { label: agent.rank, icon: agent.rankIcon };

  /* 상태에 따른 노드 스타일 */
  const nodeStyle = status === 'pending'
    ? `background:${glowColor}; border-color:var(--border); opacity:0.5;`
    : `background:${glowColor}; border-color:${accentColor};`;

  /* 상태 텍스트 */
  let statusHTML = '';
  if (status === 'done') {
    statusHTML = `<span class="step-status-text status-done-text">✓ 완료</span>`;
  } else if (status === 'running') {
    statusHTML = `
      <div class="running-indicator" aria-label="실행 중">
        <div class="running-dot"></div>
        <div class="running-dot"></div>
        <div class="running-dot"></div>
      </div>
    `;
  } else {
    statusHTML = `<span class="step-status-text status-pending-text">대기중</span>`;
  }

  const connectorLine = isLast ? '' : `<div class="step-line${status === 'done' ? ' active' : ''}"></div>`;

  return `
    <div class="agent-step" data-agent="${agent.id}" data-status="${status}">
      <div class="step-connector">
        <div class="step-node" style="${nodeStyle}" aria-label="${agent.name} 에이전트">${agent.icon}</div>
        ${connectorLine}
      </div>
      <div class="step-content${status === 'pending' ? ' pending' : ''}">
        <div class="step-header">
          <div class="step-role">
            <span style="color:${accentColor}">${agent.name}</span>
            <span class="rank-badge" style="background:${glowColor};color:${accentColor};border:1px solid ${glowColor.replace('0.15', '0.3')}">${rankData.icon} ${rankData.label}</span>
            <span class="step-model">${modelName}</span>
          </div>
          <div class="step-actions">
            <span class="step-tag tag-run" data-agent="${agent.id}" role="button" aria-label="${agent.name} 단독 실행">실행</span>
            <span class="step-tag tag-edit" data-agent="${agent.id}" role="button" aria-label="${agent.name} 프롬프트 편집">편집</span>
          </div>
        </div>
        <div class="step-output">
          <span class="output-arrow">→</span>
          <div class="output-file">📄 ${agent.outputFile}</div>
          ${statusHTML}
        </div>
      </div>
    </div>
  `;
};

/* ─── 에이전트 카드 그리드 렌더링 ─── */
const renderAgentCards = () => {
  const container = document.getElementById('agent-cards-grid');
  if (!container) return;

  const state = Store.get();

  const cardsHTML = agentsData.map(agent => {
    const override = state.agentOverrides[agent.id];
    const modelName = (override && override.model) ? override.model : agent.model;
    const multiplier = (override && override.tokenMultiplier != null) ? override.tokenMultiplier : agent.tokenMultiplier;
    const tokenText = multiplier !== null ? `×${multiplier} 토큰` : '미설정';

    /* 직급 오버라이드 반영 */
    const rankData = (override && override.rank && RANK_MAP[override.rank])
      ? RANK_MAP[override.rank]
      : { label: agent.rank, icon: agent.rankIcon };

    return `
      <div class="agent-card ${agent.colorClass}" role="button" tabindex="0"
           aria-label="${agent.name} 에이전트 설정" data-agent="${agent.id}">
        <div class="agent-card-header">
          <div class="agent-icon" style="background:var(${agent.glowVar})">${agent.icon}</div>
          <div>
            <div class="agent-name">
              ${agent.name}
              <span class="rank-badge" style="background:var(${agent.glowVar});color:var(${agent.accentVar})">${rankData.icon} ${rankData.label}</span>
            </div>
            <div class="agent-desc">${agent.desc}</div>
          </div>
        </div>
        <div class="agent-meta">
          <span class="agent-model-tag">${modelName}</span>
          <span class="agent-token">${tokenText}</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHTML;

  /* 카드 클릭 → 에이전트 설정 페이지 이동 */
  container.querySelectorAll('.agent-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `./pages/agents.html?agent=${card.dataset.agent}`;
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });
};

/* ─── 우측 실행 패널 렌더링 ─── */
const renderRunPanel = () => {
  renderRunTabs();
  renderResultList();
  renderTokenBars();
  renderOutputPreview();
};

/** 실행 탭 렌더링 */
const renderRunTabs = () => {
  const container = document.getElementById('run-tabs');
  if (!container) return;

  const tabsHTML = historyData.map((run, idx) => `
    <div class="run-tab${idx === currentRunIndex ? ' active' : ''}" data-run-index="${idx}">
      ${run.label}
    </div>
  `).join('');

  container.innerHTML = tabsHTML + `<div class="run-tab" id="new-run-tab">+ 새 실행</div>`;

  container.querySelectorAll('.run-tab[data-run-index]').forEach(tab => {
    tab.addEventListener('click', () => {
      currentRunIndex = parseInt(tab.dataset.runIndex, 10);
      renderRunPanel();
      renderPipelineSteps();
    });
  });

  document.getElementById('new-run-tab')?.addEventListener('click', startNewRun);
};

/** 결과 리스트 렌더링 */
const renderResultList = () => {
  const container = document.getElementById('run-result-list');
  if (!container) return;

  const currentRun = historyData[currentRunIndex];
  if (!currentRun) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-dim);font-size:11px;padding:20px">실행 데이터 없음</div>';
    return;
  }

  const listHTML = currentRun.results.map(result => {
    const agent = agentsData.find(a => a.id === result.agentId);
    if (!agent) return '';

    const statusIcon = result.status === 'done'
      ? '<div class="result-status status-done">✓</div>'
      : result.status === 'running'
        ? `<div class="result-status status-running"><div class="running-indicator"><div class="running-dot" style="width:3px;height:3px"></div></div></div>`
        : '<div class="result-status status-pending">–</div>';

    const timeText = result.status === 'done'
      ? `${result.duration}s`
      : result.status === 'running'
        ? `<span style="color:var(--accent-pipe)">...</span>`
        : '—';

    return `
      <div class="result-item ${result.status}" data-output-id="${result.outputId}" role="button" tabindex="0"
           aria-label="${agent.name} 결과 보기">
        ${statusIcon}
        <div class="result-info">
          <div class="result-agent">
            <span style="color:var(${agent.accentVar})">${agent.icon} ${agent.name}</span>
            <span style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted)">${agent.rank}</span>
          </div>
          <div class="result-file">→ 📄 ${agent.outputFile}</div>
        </div>
        <div class="result-time">${timeText}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = listHTML;

  /* 클릭 시 미리보기 전환 */
  container.querySelectorAll('.result-item[data-output-id]').forEach(item => {
    item.addEventListener('click', () => renderOutputPreview(item.dataset.outputId));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') renderOutputPreview(item.dataset.outputId);
    });
  });

  /* 상태 표시 업데이트 */
  updateRunStatus(currentRun.status);
};

/** 실행 상태 도트 업데이트 */
const updateRunStatus = (status) => {
  const statusEl = document.getElementById('run-status-label');
  const dotEl = document.getElementById('run-status-dot');
  if (!statusEl || !dotEl) return;

  if (status === 'running') {
    dotEl.style.background = 'var(--accent-pipe)';
    statusEl.style.color = 'var(--accent-pipe)';
    statusEl.textContent = '실행 중';
    dotEl.classList.add('pulse');
  } else if (status === 'completed') {
    dotEl.style.background = 'var(--accent-dev)';
    statusEl.style.color = 'var(--accent-dev)';
    statusEl.textContent = '완료';
    dotEl.classList.remove('pulse');
  } else {
    dotEl.style.background = 'var(--text-dim)';
    statusEl.style.color = 'var(--text-dim)';
    statusEl.textContent = '대기';
    dotEl.classList.remove('pulse');
  }
};

/** 토큰 바 렌더링 */
const renderTokenBars = () => {
  const container = document.getElementById('token-bar-wrap');
  if (!container) return;

  const currentRun = historyData[currentRunIndex];
  if (!currentRun) return;

  /* 전체 최대값 기준으로 % 계산 */
  const maxTokens = Math.max(...currentRun.results.map(r => r.tokens || 0), 1);

  const barsHTML = currentRun.results.map(result => {
    const agent = agentsData.find(a => a.id === result.agentId);
    if (!agent) return '';

    const pct = result.tokens ? Math.round((result.tokens / maxTokens) * 100) : 0;
    const valText = result.tokens ? result.tokens.toLocaleString() : '—';

    return `
      <div class="token-row">
        <div class="token-label" style="color:var(${agent.accentVar})">${agent.name}</div>
        <div class="token-bar">
          <div class="token-fill" data-width="${pct}" style="width:0%;background:var(${agent.accentVar})"></div>
        </div>
        <div class="token-val">${valText}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = barsHTML;

  /* 애니메이션: 0 → 실제 너비 */
  requestAnimationFrame(() => {
    container.querySelectorAll('.token-fill').forEach(fill => {
      const w = fill.dataset.width;
      setTimeout(() => {
        fill.style.transition = 'width 0.8s ease';
        fill.style.width = `${w}%`;
      }, 300);
    });
  });
};

/** 아웃풋 미리보기 렌더링 */
const renderOutputPreview = (outputId) => {
  const previewTitle = document.getElementById('preview-title');
  const previewText = document.getElementById('preview-text');
  const previewLink = document.getElementById('preview-link');
  if (!previewTitle || !previewText) return;

  /* outputId 없으면 현재 런의 첫 번째 완료 결과 표시 */
  const currentRun = historyData[currentRunIndex];
  const targetId = outputId || (currentRun && currentRun.results[0]?.outputId);

  const output = outputsData.find(o => o.id === targetId);
  if (!output) return;

  previewTitle.textContent = `📄 ${output.label}`;
  previewText.textContent = output.content;

  if (previewLink) {
    previewLink.href = `./pages/output.html?run=${output.runId}&output=${output.id}`;
  }
};

/* ─── 실행 시뮬레이션 ─── */
const simulateRun = async (startAgentId) => {
  if (isRunning) return;
  isRunning = true;

  const runBtn = document.getElementById('run-btn-header');
  const runBtnCard = document.getElementById('run-btn-card');
  if (runBtn) { runBtn.disabled = true; runBtn.textContent = '⏳ 실행 중...'; }
  if (runBtnCard) { runBtnCard.disabled = true; runBtnCard.innerHTML = '<span>⏳</span> 실행 중...'; }

  /* 시작 인덱스 결정 */
  const startIdx = startAgentId
    ? agentsData.findIndex(a => a.id === startAgentId)
    : 0;

  /* 새 실행 레코드 생성 */
  const newRun = {
    id: `run-sim-${Date.now()}`,
    label: `${historyData.length + 1}차 실행`,
    status: 'running',
    createdAt: new Date().toISOString(),
    completedAt: null,
    totalTokens: 0,
    completedSteps: startIdx,
    totalSteps: agentsData.length,
    results: agentsData.map((agent, idx) => ({
      agentId: agent.id,
      status: idx < startIdx ? 'done' : 'pending',
      duration: null,
      tokens: null,
      outputId: null,
    })),
  };

  historyData.unshift(newRun);
  currentRunIndex = 0;
  renderRunPanel();
  renderPipelineSteps();

  /* 각 에이전트를 순서대로 시뮬레이션 */
  for (let i = startIdx; i < agentsData.length; i++) {
    const agent = agentsData[i];
    newRun.results[i].status = 'running';
    Store.set({ activeRunStep: agent.id, pipelineStatus: 'running' });
    renderRunPanel();
    renderPipelineSteps();

    /* 2~4초 랜덤 딜레이로 실행 시뮬레이션 */
    const duration = 2 + Math.random() * 2;
    await delay(duration * 1000);

    /* 완료 처리 */
    const tokens = Math.floor(200 + Math.random() * 1200);
    newRun.results[i].status = 'done';
    newRun.results[i].duration = parseFloat(duration.toFixed(1));
    newRun.results[i].tokens = tokens;
    newRun.completedSteps = i + 1;
    newRun.totalTokens += tokens;

    renderRunPanel();
    renderPipelineSteps();
  }

  /* 전체 완료 */
  newRun.status = 'completed';
  newRun.completedAt = new Date().toISOString();
  Store.set({ activeRunStep: null, pipelineStatus: 'completed' });

  renderRunPanel();
  renderPipelineSteps();

  isRunning = false;
  if (runBtn) { runBtn.disabled = false; runBtn.textContent = '▶ 전체 실행'; }
  if (runBtnCard) { runBtnCard.disabled = false; runBtnCard.innerHTML = '<span>▶</span> 실행 중'; }
};

/** 새 실행 시작 */
const startNewRun = () => {
  if (!isRunning) simulateRun();
};

/** Promise 기반 딜레이 헬퍼 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ─── DOM 준비 후 초기화 ─── */
document.addEventListener('DOMContentLoaded', () => {
  init();

  /* 전체 실행 버튼 이벤트 */
  document.getElementById('run-btn-header')?.addEventListener('click', () => simulateRun());
  document.getElementById('run-btn-card')?.addEventListener('click', () => simulateRun());
});
