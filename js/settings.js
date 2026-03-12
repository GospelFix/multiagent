/* ========================================
   Settings JS — 설정 페이지 로직
   API 키 관리 (Provider 탭 전환 + 저장/삭제)
   ======================================== */

'use strict';

/* ─── Provider 메타 정보 ─── */
const PROVIDER_META = {
  claude: {
    placeholder: 'sk-ant-api03-...',
    subtitle: 'Anthropic Claude API 키를 입력하면 실제 AI가 결과물을 생성합니다',
    link: 'https://console.anthropic.com/settings/keys',
    linkLabel: 'Anthropic Console에서 API 키 발급하기 →',
  },
  openai: {
    placeholder: 'sk-...',
    subtitle: 'OpenAI API 키를 입력하면 실제 AI가 결과물을 생성합니다',
    link: 'https://platform.openai.com/api-keys',
    linkLabel: 'OpenAI Platform에서 API 키 발급하기 →',
  },
  custom: {
    placeholder: 'sk-... 또는 커스텀 키',
    subtitle: 'OpenAI-compatible API (Groq, Together AI, Ollama 등)',
  },
};

/* ─── 현재 선택된 Provider (localStorage 유지) ─── */
let selectedProvider = localStorage.getItem('selectedProvider') || 'claude';

/** Provider 탭 선택 상태 적용 (placeholder·링크·subtitle 교체, 커스텀 필드 표시) */
function applyProviderTab(provider) {
  selectedProvider = provider;
  localStorage.setItem('selectedProvider', provider);

  /* 탭 active 클래스 전환 */
  document.querySelectorAll('.provider-tab').forEach(btn => {
    const isActive = btn.dataset.provider === provider;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  /* 커스텀 전용 엔드포인트·모델 입력 필드 표시/숨김 */
  const customFields = document.getElementById('custom-api-fields');
  if (customFields) customFields.style.display = provider === 'custom' ? 'block' : 'none';

  /* 현재 프로바이더 키 미입력 상태에서 placeholder·발급링크·subtitle 교체 */
  const state   = Store.get();
  const apiKeys = state.apiKeys || {};
  const hasKey  = !!(apiKeys[provider] || '');

  if (!hasKey) {
    const meta       = PROVIDER_META[provider] || PROVIDER_META.claude;
    const inputEl    = document.getElementById('api-key-input');
    const subtitleEl = document.getElementById('api-key-subtitle');
    const linkEl     = document.getElementById('api-key-link');
    const linkRow    = document.getElementById('api-key-link-row');

    if (inputEl)    inputEl.placeholder   = meta.placeholder;
    if (subtitleEl) subtitleEl.textContent = meta.subtitle;
    if (linkEl && meta.link) {
      linkEl.href        = meta.link;
      linkEl.textContent = meta.linkLabel || '';
      linkEl.className   = `api-key-link provider-${provider}`;
    }
    /* 커스텀 탭은 발급 링크 숨김 */
    if (linkRow) linkRow.style.display = meta.link ? 'block' : 'none';
  }

  /* 커스텀 탭 저장값 복원 */
  if (provider === 'custom') {
    const endpointInput = document.getElementById('custom-endpoint-input');
    const modelInput    = document.getElementById('custom-model-input');
    if (endpointInput) endpointInput.value = state.customApiEndpoint || '';
    if (modelInput)    modelInput.value    = state.customModelId     || '';
  }
}

/** API 키 상태 UI 업데이트 */
const updateApiKeyUI = () => {
  const statusEl = document.getElementById('api-key-status');
  const clearBtn = document.getElementById('api-key-clear-btn');
  const inputEl  = document.getElementById('api-key-input');
  const state    = Store.get();
  const apiKeys  = state.apiKeys || {};

  /* 연결된 프로바이더 목록 */
  const connectedLabels = [
    apiKeys.claude ? 'Claude' : null,
    apiKeys.openai ? 'OpenAI' : null,
    apiKeys.custom ? '커스텀' : null,
  ].filter(Boolean);
  const hasAnyKey = connectedLabels.length > 0;

  /* 연결 상태 배지 */
  if (statusEl) {
    statusEl.className = `api-key-status ${hasAnyKey ? 'connected' : 'disconnected'}`;
    statusEl.textContent = hasAnyKey
      ? `● ${connectedLabels.join(' · ')} 연결됨`
      : '○ 미연결 (목업 모드)';
  }

  /* 삭제 버튼: 현재 탭 프로바이더에 키가 있을 때만 표시 */
  const curProviderHasKey = !!(apiKeys[selectedProvider] || '');
  if (clearBtn) clearBtn.style.display = curProviderHasKey ? 'inline-flex' : 'none';

  if (curProviderHasKey) {
    if (inputEl) inputEl.placeholder = '새 키로 교체하려면 입력...';
  } else {
    applyProviderTab(selectedProvider);
  }
};

/* ─── 내 에이전트 탭 — 파이프라인 샘플 데이터 ─── */
/* 단계 컬러 팔레트 (인덱스 순환) */
const STEP_PALETTE = ['#f59e0b', '#22c55e', '#8b5cf6', '#ef4444', '#3b82f6', '#f97316'];

const MY_PIPELINES = [
  {
    id: 'qa-analyst',
    emoji: '🔍',
    iconBg: '#1a2540',
    name: 'Q&A 분석가',
    typeLabel: '단일 에이전트',
    model: 'claude-haiku-4-5-20251001',
    desc: '질문에 대해 체계적으로 분석하고 핵심 인사이트를 도출합니다.',
    tags: ['qa analyst'],
    steps: [
      { name: 'QA Analyst', role: '분석가', icon: '🔬', outputFile: 'qa_report' },
    ],
    btnColor: '#5b5ef4',
  },
  {
    id: 'content-writer',
    emoji: '✍️',
    iconBg: '#142b1a',
    name: '콘텐츠 작가',
    typeLabel: '단일 에이전트',
    model: 'claude-haiku-4-5-20251001',
    desc: '블로그 포스트, SNS 콘텐츠, 마케팅 카피를 작성합니다.',
    tags: ['content writer'],
    steps: [
      { name: 'Content Writer', role: '작가', icon: '✍️', outputFile: 'content_draft' },
    ],
    btnColor: '#22c55e',
  },
  {
    id: 'blog-posting',
    emoji: '📝',
    iconBg: '#1e1e14',
    name: '블로그 포스팅',
    typeLabel: '파이프라인',
    model: 'claude-haiku-4-5',
    desc: '주제 입력 → 리서치 → 초안 작성 → SEO 최적화 → HTML 파일 완성',
    tags: ['blog researcher', 'blog writer', 'blog seo editor', 'blog html publisher'],
    steps: [
      { name: 'Blog Researcher',     role: '리서처',     icon: '🔍', outputFile: 'blog_research' },
      { name: 'Blog Writer',         role: '작가',       icon: '✍️', outputFile: 'blog_draft' },
      { name: 'Blog Seo Editor',     role: 'SEO 편집자', icon: '⚡', outputFile: 'blog_seo' },
      { name: 'Blog Html Publisher', role: 'HTML 발행기', icon: '🌐', outputFile: 'blog_html' },
    ],
    btnColor: '#3b82f6',
  },
  {
    id: 'business-plan',
    emoji: '📋',
    iconBg: '#2a1e10',
    name: '사업 기획서',
    typeLabel: '파이프라인',
    model: 'claude-haiku-4-5',
    desc: '아이디어 입력 → 시장 분석 → 기획서 초안 → 전문가 검토 → DOCX 문서',
    tags: ['market analyst', 'plan writer', 'plan reviewer', 'plan doc builder'],
    steps: [
      { name: 'Market Analyst',   role: '시장 분석가', icon: '📊', outputFile: 'market_analysis' },
      { name: 'Plan Writer',      role: '기획 작가',   icon: '📋', outputFile: 'plan_draft' },
      { name: 'Plan Reviewer',    role: '검토자',      icon: '🔎', outputFile: 'plan_review' },
      { name: 'Plan Doc Builder', role: '문서 빌더',   icon: '🗂️', outputFile: 'plan_doc' },
    ],
    btnColor: '#f59e0b',
  },
];

/** 파이프라인 카드 그리드 렌더링 */
const renderMyAgentsGrid = () => {
  const grid = document.getElementById('my-agents-grid');
  if (!grid) return;

  /* 카드 렌더링 */
  const cardsHTML = MY_PIPELINES.map((p) => {
    /* 태그 HTML (파이프라인은 화살표 포함) */
    const tagsHTML = p.tags.length > 1
      ? p.tags.map((t, i) => `
          <span class="ap-tag">${t}</span>
          ${i < p.tags.length - 1 ? '<span class="ap-tag-arrow">→</span>' : ''}
        `).join('')
      : `<span class="ap-tag">${p.tags[0]}</span>`;

    return `
      <div class="ap-card" data-pipeline-id="${p.id}">
        <div class="ap-card-top">
          <div class="ap-icon" style="background:${p.iconBg}">${p.emoji}</div>
          <div class="ap-card-info">
            <div class="ap-card-name">${p.name}</div>
            <div class="ap-card-type">${p.typeLabel} · ${p.model}</div>
          </div>
          <div class="ap-card-btns">
            <button class="ap-icon-btn" aria-label="도움말">?</button>
            <button class="ap-icon-btn ap-remove-btn" aria-label="삭제">×</button>
          </div>
        </div>
        <div class="ap-card-desc">${p.desc}</div>
        <div class="ap-tags">${tagsHTML}</div>
        <button class="ap-run-btn" style="background:${p.btnColor}" data-pipeline-id="${p.id}">► 실행하기</button>
      </div>
    `;
  }).join('');

  /* 새 파이프라인 만들기 카드 */
  const newCardHTML = `
    <div class="ap-card-new" id="ap-new-card">
      <div class="ap-card-new-icon">+</div>
      <div class="ap-card-new-label">새 파이프라인<br>만들기</div>
    </div>
  `;

  grid.innerHTML = cardsHTML + newCardHTML;

  /* 실행 버튼 이벤트 */
  grid.querySelectorAll('.ap-run-btn').forEach(btn => {
    btn.addEventListener('click', () => openPipelineModal(btn.dataset.pipelineId));
  });
};

/* ─── 현재 모달에 열려있는 파이프라인 ID ─── */
let currentModalPipelineId = null;

/* ─── 하단 실행 바 상태 ─── */
let executions = [];
let execIdCounter = 0;
let selectedExecId = null; // 현재 단계 패널에 표시할 실행 ID
let isDetailOpen = localStorage.getItem('execDetailOpen') !== 'false'; // 패널 열림 상태 (기본 true)

/** 실행 파이프라인 패널 열기/닫기 토글 */
const toggleDetailPanel = (forceOpen) => {
  isDetailOpen = forceOpen !== undefined ? forceOpen : !isDetailOpen;
  localStorage.setItem('execDetailOpen', String(isDetailOpen));

  const panel = document.getElementById('exec-detail-panel');
  const toggleBtn = document.getElementById('exec-bar-toggle');
  if (panel)     panel.classList.toggle('closed', !isDetailOpen);
  if (toggleBtn) toggleBtn.textContent = isDetailOpen ? '▼' : '▲';

  /* 패널 높이 변화 후 여백 재보정 */
  setTimeout(() => {
    const bar = document.getElementById('exec-bar');
    if (bar) document.body.style.paddingBottom = `${bar.offsetHeight}px`;
  }, 320); // transition 완료 후
};

/** 파이프라인 실행 모달 열기 */
const openPipelineModal = (pipelineId) => {
  const pipeline = MY_PIPELINES.find(p => p.id === pipelineId);
  if (!pipeline) return;

  const overlay = document.getElementById('pipeline-run-overlay');
  if (!overlay) return;

  currentModalPipelineId = pipelineId;

  /* 모달 내용 채우기 */
  document.getElementById('prm-icon').textContent = pipeline.emoji;
  document.getElementById('prm-icon').style.background = pipeline.iconBg;
  document.getElementById('prm-title').textContent = pipeline.name;
  document.getElementById('prm-subtitle').textContent = `${pipeline.steps.length}단계 파이프라인`;

  /* 파이프라인 단계 목록 */
  const stepsList = document.getElementById('prm-steps-list');
  stepsList.innerHTML = pipeline.steps.map((step, i) => `
    <div class="prm-step-item">
      <div class="prm-step-num">${i + 1}</div>
      <div>
        <span class="prm-step-name">${step.name}</span>
        <span class="prm-step-role">(${step.role})</span>
      </div>
    </div>
  `).join('');

  /* 입력 초기화 + 버튼 비활성화 */
  const inputEl = document.getElementById('prm-input');
  if (inputEl) inputEl.value = '';
  document.getElementById('prm-file-name').textContent = '선택된 파일 없음';
  updateRunButton();

  /* 언어 버튼 초기화 */
  document.querySelectorAll('.prm-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === 'ko');
  });

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  /* 입력 포커스 */
  setTimeout(() => inputEl?.focus(), 80);
};

/** 파이프라인 실행 모달 닫기 */
const closePipelineModal = () => {
  const overlay = document.getElementById('pipeline-run-overlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
  currentModalPipelineId = null;
};

/** 실행 시작 버튼 활성화 상태 갱신 (입력 내용이 있으면 활성화) */
const updateRunButton = () => {
  const btn   = document.getElementById('prm-run-btn');
  const input = document.getElementById('prm-input');
  if (!btn || !input) return;
  const hasContent = input.value.trim().length > 0;
  btn.classList.toggle('enabled', hasContent);
};

/* ─── 하단 실행 바: 실행 시작 ─── */
const startExecution = (pipelineId) => {
  const pipeline = MY_PIPELINES.find(p => p.id === pipelineId);
  if (!pipeline) return;

  const execId = ++execIdCounter;
  executions.push({ id: execId, pipeline, currentStep: 0, status: 'waiting' });
  selectedExecId = execId; // 새로 시작한 실행 자동 선택
  renderExecBar();

  /* 1초 후 첫 단계 시작 */
  setTimeout(() => tickExecStep(execId), 1000);
};

/** 실행 단계 진행 (단계당 1.8초 딜레이 시뮬레이션) */
const tickExecStep = (execId) => {
  const exec = executions.find(e => e.id === execId);
  if (!exec) return;

  exec.currentStep += 1;
  exec.status = exec.currentStep > exec.pipeline.steps.length ? 'done' : 'running';
  renderExecBar();

  if (exec.status === 'running') {
    setTimeout(() => tickExecStep(execId), 1800);
  }
};

/** 실행 칩 제거 */
const removeExecution = (execId) => {
  executions = executions.filter(e => e.id !== execId);
  /* 제거된 것이 선택 중이었으면 첫 번째로 재선택 */
  if (selectedExecId === execId) {
    selectedExecId = executions.length > 0 ? executions[0].id : null;
  }
  renderExecBar();
};

/** 단계별 상태 계산 헬퍼 — 'pending' | 'running' | 'done' */
const getStepStatus = (exec, stepIndex) => {
  const { currentStep, status } = exec;
  if (status === 'waiting') return 'pending';
  if (status === 'done')    return 'done';
  /* running: currentStep은 1-based (1 = 첫 번째 단계 실행 중) */
  if (stepIndex < currentStep - 1) return 'done';
  if (stepIndex === currentStep - 1) return 'running';
  return 'pending';
};

/** 하단 실행 바 렌더링 (칩 행 + 단계 패널) */
const renderExecBar = () => {
  const bar = document.getElementById('exec-bar');
  if (!bar) return;

  if (executions.length === 0) {
    bar.style.display = 'none';
    document.body.classList.remove('exec-bar-visible');
    document.body.style.paddingBottom = '';
    return;
  }

  bar.style.display = 'flex';
  document.body.classList.add('exec-bar-visible');

  /* ── 헤더 토글 버튼 상태 업데이트 ── */
  const toggleBtn = document.getElementById('exec-bar-toggle');
  if (toggleBtn) toggleBtn.textContent = isDetailOpen ? '▼' : '▲';

  /* ── 칩 행 렌더링 ── */
  const itemsEl = document.getElementById('exec-bar-items');
  if (itemsEl) {
    itemsEl.innerHTML = executions.map(exec => {
      const { pipeline, currentStep, status, id } = exec;
      const isActive = id === selectedExecId;

      let progressText = '대기 중';
      let badgeText    = '대기';
      let badgeClass   = 'waiting';

      if (status === 'running') {
        progressText = `${currentStep}/${pipeline.steps.length}단계`;
        badgeText    = '실행 중';
        badgeClass   = 'running';
      } else if (status === 'done') {
        progressText = '완료';
        badgeText    = '완료';
        badgeClass   = 'done';
      }

      return `
        <div class="exec-chip${isActive ? ' active' : ''}" data-select-exec="${id}">
          <div class="exec-chip-icon" style="background:${pipeline.iconBg}">${pipeline.emoji}</div>
          <div class="exec-chip-info">
            <div class="exec-chip-name">${pipeline.name}</div>
            <div class="exec-chip-progress">${progressText}</div>
          </div>
          <span class="exec-chip-badge ${badgeClass}">${badgeText}</span>
          <button class="exec-chip-close" data-exec-id="${id}" aria-label="닫기">×</button>
        </div>
      `;
    }).join('');

    /* 칩 클릭 → 선택 전환 */
    itemsEl.querySelectorAll('.exec-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.closest('.exec-chip-close')) return;
        selectedExecId = Number(chip.dataset.selectExec);
        renderExecBar();
      });
    });

    /* 닫기 이벤트 */
    itemsEl.querySelectorAll('.exec-chip-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeExecution(Number(btn.dataset.execId));
      });
    });
  }

  /* ── 단계 패널 렌더링 ── */
  let detailEl = document.getElementById('exec-detail-panel');
  if (!detailEl) {
    detailEl = document.createElement('div');
    detailEl.id = 'exec-detail-panel';
    detailEl.className = 'exec-detail-panel';
    bar.appendChild(detailEl);
  }
  /* 현재 열림 상태 반영 */
  detailEl.classList.toggle('closed', !isDetailOpen);

  const selectedExec = executions.find(e => e.id === selectedExecId);
  if (!selectedExec) {
    detailEl.innerHTML = '';
  } else {
    const totalSteps = selectedExec.pipeline.steps.length;

    const stepsHTML = selectedExec.pipeline.steps.map((step, i) => {
      const st      = getStepStatus(selectedExec, i);
      const color   = STEP_PALETTE[i % STEP_PALETTE.length];
      const isLast  = i === totalSteps - 1;

      /* 원형 아이콘 스타일 */
      const circleBorder = st === 'pending' ? `${color}38` : color;
      const circleBg     = `${color}12`;
      const circleClass  = st === 'running' ? 'es-circle es-running' : 'es-circle';

      /* CSS 커스텀 프로퍼티로 pulse 색상 전달 */
      const circleStyle = `border-color:${circleBorder};background:${circleBg};--es-color:${color}50`;

      /* 상태 레이블 */
      const statusHTML = st === 'done'
        ? `<span class="es-status st-done">✓ 완료</span>`
        : st === 'running'
        ? `<span class="es-status st-running"><span class="es-dot"></span>실행 중</span>`
        : `<span class="es-status st-pending">대기중</span>`;

      /* 아웃풋 파일 상태 */
      const fileStatus = st === 'done' ? '완료' : st === 'running' ? '처리 중' : '대기중';

      return `
        <div class="es-item es-${st}">
          <div class="es-left">
            <div class="${circleClass}" style="${circleStyle}">${step.icon || '⚡'}</div>
            ${!isLast ? '<div class="es-connector"></div>' : ''}
          </div>
          <div class="es-body">
            <div class="es-main">
              <div class="es-info">
                <span class="es-name" style="color:${color}">${step.name.toUpperCase()}</span>
                <span class="es-badge" style="color:${color};border-color:${color}35;background:${color}12">${step.role}</span>
                <span class="es-model">${selectedExec.pipeline.model}</span>
              </div>
              <div class="es-actions">${statusHTML}</div>
            </div>
            <div class="es-output">
              <span class="es-output-arrow">→</span>
              <span class="es-filename">📄 ${step.outputFile}</span>
              <span class="es-file-status st-${st}">${fileStatus}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    detailEl.innerHTML = `
      <div class="exec-detail-header">
        <div class="exec-detail-label">실행 파이프라인</div>
        <button class="exec-detail-close" id="exec-detail-close" aria-label="패널 닫기">×</button>
      </div>
      <div class="exec-steps-list">${stepsHTML}</div>
    `;

    /* 패널 닫기 버튼 이벤트 */
    document.getElementById('exec-detail-close')?.addEventListener('click', () => {
      toggleDetailPanel(false);
    });
  }

  /* 콘텐츠 하단 여백 동적 보정 */
  requestAnimationFrame(() => {
    document.body.style.paddingBottom = `${bar.offsetHeight}px`;
  });
};

/* ─── 설정 탭 패널 전환 ─── */
const initSettingsTabs = () => {
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      /* 탭 active 전환 */
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      /* 패널 표시/숨김 */
      const target = tab.dataset.panel;
      document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${target}`);
      });
    });
  });
};

/* ─── DOM 준비 후 초기화 ─── */
document.addEventListener('DOMContentLoaded', () => {
  /* 하위 호환 마이그레이션: 구 apiKey → apiKeys.claude / apiKeys.openai */
  const legacyKey = Store.get().apiKey || '';
  if (legacyKey) {
    const existing = Store.get().apiKeys || {};
    if (!existing.claude && !existing.openai) {
      if (legacyKey.startsWith('sk-ant-')) {
        Store.set({ apiKeys: { ...existing, claude: legacyKey } });
      } else if (legacyKey.startsWith('sk-')) {
        Store.set({ apiKeys: { ...existing, openai: legacyKey } });
      }
    }
  }

  /* 설정 탭 초기화 */
  initSettingsTabs();

  /* 내 에이전트 그리드 렌더링 */
  renderMyAgentsGrid();

  /* 모달 닫기 이벤트 */
  document.getElementById('prm-close')?.addEventListener('click', closePipelineModal);
  document.getElementById('pipeline-run-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closePipelineModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePipelineModal();
  });

  /* 모달 언어 토글 */
  document.querySelectorAll('.prm-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.prm-lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* 모달 파일 선택 → 파일명 표시 */
  document.getElementById('prm-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    document.getElementById('prm-file-name').textContent = file ? file.name : '선택된 파일 없음';
  });

  /* 하단 바 토글 버튼 */
  document.getElementById('exec-bar-toggle')?.addEventListener('click', () => toggleDetailPanel());

  /* 텍스트 입력 → 실행 버튼 활성화 */
  document.getElementById('prm-input')?.addEventListener('input', updateRunButton);

  /* 실행 시작 버튼 클릭 */
  document.getElementById('prm-run-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('prm-run-btn');
    if (!btn?.classList.contains('enabled')) return;
    if (!currentModalPipelineId) return;
    startExecution(currentModalPipelineId);
    closePipelineModal();
  });

  /* Provider 탭 이벤트 */
  document.querySelectorAll('.provider-tab').forEach(btn => {
    btn.addEventListener('click', () => applyProviderTab(btn.dataset.provider));
  });

  /* API 키 UI 초기화 (탭 상태 포함) */
  applyProviderTab(selectedProvider);
  updateApiKeyUI();

  /* API 키 저장 버튼 */
  document.getElementById('api-key-save-btn')?.addEventListener('click', () => {
    const input = document.getElementById('api-key-input');
    if (!input) return;
    const key = input.value.trim();

    const state   = Store.get();
    const apiKeys = state.apiKeys || {};

    if (selectedProvider === 'custom') {
      /* 커스텀: 엔드포인트·모델명도 함께 저장 */
      const endpointInput = document.getElementById('custom-endpoint-input');
      const modelInput    = document.getElementById('custom-model-input');
      Store.set({
        apiKeys: { ...apiKeys, custom: key },
        customApiEndpoint: endpointInput?.value.trim() || '',
        customModelId:     modelInput?.value.trim()    || '',
      });
    } else {
      /* claude / openai */
      Store.set({ apiKeys: { ...apiKeys, [selectedProvider]: key } });
    }

    updateApiKeyUI();
  });

  /* API 키 삭제 버튼 (현재 선택된 프로바이더 키 삭제) */
  document.getElementById('api-key-clear-btn')?.addEventListener('click', () => {
    const state   = Store.get();
    const apiKeys = state.apiKeys || {};
    Store.set({ apiKeys: { ...apiKeys, [selectedProvider]: '' } });
    updateApiKeyUI();
  });

  /* 툴팁 오버레이 초기화 */
  const overlay = document.createElement('div');
  overlay.id = 'tt-overlay';
  document.body.appendChild(overlay);

  document.querySelectorAll('.tooltip-wrap').forEach(wrap => {
    const icon    = wrap.querySelector('.tooltip-icon');
    const content = wrap.querySelector('.tooltip-popup');
    if (!icon || !content) return;

    const show = () => {
      overlay.innerHTML = content.innerHTML;
      overlay.classList.add('visible');
      const rect = icon.getBoundingClientRect();
      overlay.style.top  = `${rect.bottom + 8}px`;
      overlay.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
    };
    const hide = () => overlay.classList.remove('visible');

    icon.addEventListener('mouseenter', show);
    icon.addEventListener('focus', show);
    icon.addEventListener('mouseleave', hide);
    icon.addEventListener('blur', hide);
  });
});
