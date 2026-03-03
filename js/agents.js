/* ========================================
   Agents JS — 에이전트 설정 페이지 로직
   Provider/Model 캐스케이딩 + 직급별 토큰 제한
   + System Prompt + API Key 편집
   ======================================== */

'use strict';

let agentsData = [];
let selectedAgentId = null;

/* ─── Provider → Model 계층 구조 ─── */
const PROVIDER_MODELS = {
  anthropic: {
    label: 'Anthropic',
    icon: '🤖',
    models: [
      { value: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  desc: '빠름 · 저비용' },
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', desc: '균형 · 추천' },
      { value: 'claude-opus-4-6',   label: 'Claude Opus 4.6',   desc: '최고성능 · 고비용' },
    ],
  },
  google: {
    label: 'Google',
    icon: '✦',
    models: [
      { value: 'gemini-2.0-flash',  label: 'Gemini 2.0 Flash',  desc: '빠름 · 멀티모달' },
      { value: 'gemini-1.5-pro',    label: 'Gemini 1.5 Pro',    desc: '고성능 · 긴 컨텍스트' },
      { value: 'gemini-1.5-flash',  label: 'Gemini 1.5 Flash',  desc: '경량 · 저비용' },
    ],
  },
  openai: {
    label: 'OpenAI',
    icon: '◆',
    models: [
      { value: 'gpt-4o',      label: 'GPT-4o',      desc: '멀티모달 · 최신' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: '경량 · 저비용' },
      { value: 'o1-mini',     label: 'O1 Mini',     desc: '추론 특화' },
    ],
  },
  codex: {
    label: 'OpenAI Codex',
    icon: '⌨',
    models: [
      { value: 'codex-mini-latest', label: 'Codex Mini', desc: '코드 생성 특화' },
    ],
  },
};

/* ─── 직급 옵션 (토큰 제한 포함) ─── */
const RANK_OPTIONS = [
  { value: 'intern',     label: '인턴',     icon: '🔰', tokenLimit: 500,   colorVar: '--text-dim' },
  { value: 'junior',     label: '신입사원', icon: '🌱', tokenLimit: 1000,  colorVar: '--accent-dev' },
  { value: 'associate',  label: '대리',     icon: '🖥',  tokenLimit: 2000,  colorVar: '--accent-design' },
  { value: 'manager',    label: '과장',     icon: '⭐', tokenLimit: 4000,  colorVar: '--accent-pm' },
  { value: 'lead',       label: '팀장',     icon: '👑', tokenLimit: 8000,  colorVar: '--accent-qa' },
  { value: 'director',   label: '부장',     icon: '🏆', tokenLimit: null,  colorVar: '--accent-pipe' },
];

/* ─── 초기화 ─── */
const init = async () => {
  try {
    const data = await fetchJSON('../data/agents.json');
    agentsData = data.agents;

    renderAgentList();

    const params = new URLSearchParams(window.location.search);
    const agentParam = params.get('agent');
    if (agentParam) selectAgent(agentParam);
    else renderEmptyPanel();
  } catch (e) {
    console.error('에이전트 데이터 로드 실패:', e);
  }
};

/** JSON fetch 헬퍼 */
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch 실패: ${url}`);
  return res.json();
};

/* ─── 모델 값에서 provider 자동 감지 ─── */
const detectProvider = (modelValue) => {
  if (!modelValue) return 'anthropic';
  if (modelValue.startsWith('claude'))  return 'anthropic';
  if (modelValue.startsWith('gemini'))  return 'google';
  if (modelValue.startsWith('codex'))   return 'codex';
  if (modelValue.startsWith('gpt') || modelValue.startsWith('o1') || modelValue.startsWith('o3')) return 'openai';
  return 'anthropic';
};

/* ─── 직급 라벨 → value 변환 ─── */
const rankLabelToValue = (label) => {
  const found = RANK_OPTIONS.find(r => r.label === label);
  return found ? found.value : 'junior';
};

/* ─── 에이전트 목록 렌더링 ─── */
const renderAgentList = () => {
  const container = document.getElementById('agent-list');
  if (!container) return;

  const state = Store.get();

  const listHTML = agentsData.map(agent => {
    const override = state.agentOverrides[agent.id] || {};
    const modelName = override.model || agent.model;
    const provider = PROVIDER_MODELS[override.provider || detectProvider(modelName)];
    const rankValue = override.rank || rankLabelToValue(agent.rank);
    const rankOption = RANK_OPTIONS.find(r => r.value === rankValue) || RANK_OPTIONS[1];
    const tokenText = rankOption.tokenLimit ? `${rankOption.tokenLimit.toLocaleString()} 토큰 제한` : '무제한';
    const isSelected = agent.id === selectedAgentId;

    return `
      <div class="agent-setting-card ${agent.colorClass}${isSelected ? ' selected' : ''}"
           data-agent="${agent.id}" role="button" tabindex="0" aria-label="${agent.name} 에이전트 설정">
        <div class="setting-card-icon" style="background:var(${agent.glowVar})">${agent.icon}</div>
        <div class="setting-card-info">
          <div class="setting-card-name">
            <span style="color:var(${agent.accentVar})">${agent.name}</span>
            <span class="rank-badge" style="background:var(${agent.glowVar});color:var(${agent.accentVar})">
              ${rankOption.icon} ${rankOption.label}
            </span>
          </div>
          <div class="setting-card-desc">${agent.desc}</div>
        </div>
        <div class="setting-card-meta">
          <div class="setting-card-model">${provider?.icon || ''} ${modelName}</div>
          <div class="setting-card-multiplier" style="color:var(${rankOption.colorVar})">${tokenText}</div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = listHTML;

  container.querySelectorAll('.agent-setting-card').forEach(card => {
    card.addEventListener('click', () => selectAgent(card.dataset.agent));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') selectAgent(card.dataset.agent);
    });
  });
};

/** 에이전트 선택 → 편집 패널 열기 */
const selectAgent = (agentId) => {
  selectedAgentId = agentId;
  renderAgentList();
  renderEditPanel(agentId);
};

/* ─── 편집 패널 렌더링 ─── */
const renderEditPanel = (agentId) => {
  const panel = document.getElementById('edit-panel');
  if (!panel) return;

  const agent = agentsData.find(a => a.id === agentId);
  if (!agent) return;

  const state = Store.get();
  const override = state.agentOverrides[agentId] || {};

  /* 현재 값 결정 */
  const currentModel    = override.model      || agent.model;
  const currentProvider = override.provider   || detectProvider(currentModel);
  const currentRank     = override.rank       || rankLabelToValue(agent.rank);
  const currentPrompt   = override.systemPrompt != null ? override.systemPrompt : (agent.systemPrompt || '');
  const currentApiKey   = override.apiKey     || '';

  /* Provider 옵션 HTML */
  const providerOptionsHTML = Object.entries(PROVIDER_MODELS).map(([key, p]) => `
    <option value="${key}"${currentProvider === key ? ' selected' : ''}>${p.icon} ${p.label}</option>
  `).join('');

  /* 현재 Provider의 Model 옵션 HTML */
  const modelOptionsHTML = buildModelOptions(currentProvider, currentModel);

  /* 직급 옵션 HTML */
  const rankOptionsHTML = RANK_OPTIONS.map(r => `
    <option value="${r.value}"${currentRank === r.value ? ' selected' : ''}>
      ${r.icon} ${r.label}${r.tokenLimit ? ` — ${r.tokenLimit.toLocaleString()} 토큰` : ' — 무제한'}
    </option>
  `).join('');

  /* 현재 직급의 토큰 제한 */
  const rankOption = RANK_OPTIONS.find(r => r.value === currentRank) || RANK_OPTIONS[1];

  panel.innerHTML = `
    <div class="edit-panel-header">
      <div>
        <div class="edit-panel-title">${agent.icon} ${agent.name} 설정</div>
        <div class="edit-panel-agent-label">${agent.desc}</div>
      </div>
      <button class="btn btn-ghost btn-sm" id="close-panel-btn" aria-label="패널 닫기">✕</button>
    </div>
    <div class="edit-panel-body">

      <!-- ① Provider -->
      <div class="panel-section">
        <div class="panel-section-title">AI 설정</div>

        <div class="form-group">
          <label class="form-label" for="provider-select">Provider</label>
          <select class="form-select" id="provider-select" aria-label="AI 제공자 선택">
            ${providerOptionsHTML}
          </select>
        </div>

        <!-- ② Model (Provider 변경 시 동적 갱신) -->
        <div class="form-group">
          <label class="form-label" for="model-select">Model</label>
          <select class="form-select" id="model-select" aria-label="모델 선택">
            ${modelOptionsHTML}
          </select>
          <div class="form-hint" id="model-hint">${getModelHint(currentProvider, currentModel)}</div>
        </div>
      </div>

      <!-- ③ 직급 -->
      <div class="panel-section">
        <div class="panel-section-title">직급 & 토큰 제한</div>

        <div class="form-group">
          <label class="form-label" for="rank-select">직급</label>
          <select class="form-select" id="rank-select" aria-label="직급 선택">
            ${rankOptionsHTML}
          </select>
        </div>

        <!-- 토큰 제한 뱃지 -->
        <div class="rank-token-display" id="rank-token-display">
          ${buildRankTokenDisplay(rankOption)}
        </div>
      </div>

      <!-- ④ System Prompt -->
      <div class="panel-section">
        <div class="panel-section-title">System Prompt</div>
        <div class="form-group">
          <div class="form-label-row">
            <label class="form-label" for="system-prompt-input">시스템 프롬프트</label>
            <span class="form-token-count" id="prompt-token-count">${estimateTokens(currentPrompt)} 토큰</span>
          </div>
          <textarea
            class="form-textarea"
            id="system-prompt-input"
            rows="6"
            placeholder="에이전트의 역할과 지시사항을 작성하세요..."
            aria-label="시스템 프롬프트"
            spellcheck="false"
          >${currentPrompt}</textarea>
        </div>
      </div>

      <!-- ⑤ API Key (선택) -->
      <div class="panel-section">
        <div class="panel-section-title">API Key <span class="optional-label">선택사항</span></div>
        <div class="form-group">
          <label class="form-label" for="api-key-input">API Key</label>
          <div class="api-key-wrap">
            <input
              type="password"
              class="form-input api-key-input"
              id="api-key-input"
              placeholder="sk-... 또는 AIza..."
              value="${currentApiKey}"
              aria-label="API Key 입력"
              autocomplete="off"
            >
            <button class="api-key-toggle" id="api-key-toggle" type="button" aria-label="API Key 표시/숨기기">
              👁
            </button>
          </div>
          <div class="form-hint form-hint-warn">
            ⚠ localStorage에 저장됩니다. 프로덕션 환경에서는 환경변수를 사용하세요.
          </div>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <button class="save-btn" id="save-agent-btn" data-agent="${agentId}">
        저장하기
      </button>

    </div>
  `;

  /* ─── 이벤트 바인딩 ─── */

  /* Provider 변경 → Model 옵션 동적 갱신 */
  panel.querySelector('#provider-select').addEventListener('change', (e) => {
    const newProvider = e.target.value;
    const modelSelect = panel.querySelector('#model-select');
    const modelHint = panel.querySelector('#model-hint');
    modelSelect.innerHTML = buildModelOptions(newProvider, null);
    modelHint.textContent = getModelHint(newProvider, modelSelect.value);
  });

  /* Model 변경 → 힌트 갱신 */
  panel.querySelector('#model-select').addEventListener('change', (e) => {
    const provider = panel.querySelector('#provider-select').value;
    panel.querySelector('#model-hint').textContent = getModelHint(provider, e.target.value);
  });

  /* 직급 변경 → 토큰 제한 뱃지 갱신 */
  panel.querySelector('#rank-select').addEventListener('change', (e) => {
    const selectedRank = RANK_OPTIONS.find(r => r.value === e.target.value);
    const display = panel.querySelector('#rank-token-display');
    if (selectedRank && display) display.innerHTML = buildRankTokenDisplay(selectedRank);
  });

  /* System Prompt → 토큰 추정 실시간 갱신 */
  panel.querySelector('#system-prompt-input').addEventListener('input', (e) => {
    const countEl = panel.querySelector('#prompt-token-count');
    if (countEl) countEl.textContent = `${estimateTokens(e.target.value)} 토큰`;
  });

  /* API Key 표시/숨기기 토글 */
  panel.querySelector('#api-key-toggle').addEventListener('click', () => {
    const input = panel.querySelector('#api-key-input');
    const btn = panel.querySelector('#api-key-toggle');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? '🙈' : '👁';
    btn.setAttribute('aria-label', isHidden ? 'API Key 숨기기' : 'API Key 표시');
  });

  /* 저장 */
  panel.querySelector('#save-agent-btn').addEventListener('click', () => saveAgent(agentId));

  /* 닫기 */
  panel.querySelector('#close-panel-btn').addEventListener('click', () => {
    selectedAgentId = null;
    renderAgentList();
    renderEmptyPanel();
  });
};

/** Provider에 따른 Model 옵션 HTML 생성 */
const buildModelOptions = (providerKey, selectedModel) => {
  const provider = PROVIDER_MODELS[providerKey];
  if (!provider) return '';
  return provider.models.map(m => `
    <option value="${m.value}"${selectedModel === m.value ? ' selected' : ''}>${m.label} — ${m.desc}</option>
  `).join('');
};

/** 모델 힌트 텍스트 반환 */
const getModelHint = (providerKey, modelValue) => {
  const provider = PROVIDER_MODELS[providerKey];
  if (!provider) return '';
  const model = provider.models.find(m => m.value === modelValue);
  return model ? `${provider.icon} ${provider.label} · ${model.desc}` : '';
};

/** 직급 토큰 제한 뱃지 HTML */
const buildRankTokenDisplay = (rankOption) => {
  const limitText = rankOption.tokenLimit
    ? `최대 ${rankOption.tokenLimit.toLocaleString()} 토큰`
    : '토큰 무제한';
  const barPct = rankOption.tokenLimit
    ? Math.min(100, Math.round((rankOption.tokenLimit / 8000) * 100))
    : 100;
  const fillColor = rankOption.colorVar;

  return `
    <div class="rank-token-card">
      <div class="rank-token-top">
        <span class="rank-token-icon">${rankOption.icon}</span>
        <span class="rank-token-label">${rankOption.label}</span>
        <span class="rank-token-limit" style="color:var(${fillColor})">${limitText}</span>
      </div>
      <div class="rank-token-bar">
        <div class="rank-token-fill" style="width:${barPct}%;background:var(${fillColor})"></div>
      </div>
    </div>
  `;
};

/** 토큰 추정: 글자 수 ÷ 4 */
const estimateTokens = (text) => Math.ceil((text || '').length / 4);

/** 빈 패널 표시 */
const renderEmptyPanel = () => {
  const panel = document.getElementById('edit-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="empty-panel">
      <div class="empty-panel-icon">⚙️</div>
      <div class="empty-panel-text">에이전트를 선택하면<br>설정을 변경할 수 있습니다</div>
    </div>
  `;
};

/* ─── 에이전트 설정 저장 ─── */
const saveAgent = (agentId) => {
  const providerSelect = document.getElementById('provider-select');
  const modelSelect    = document.getElementById('model-select');
  const rankSelect     = document.getElementById('rank-select');
  const promptInput    = document.getElementById('system-prompt-input');
  const apiKeyInput    = document.getElementById('api-key-input');

  if (!providerSelect || !modelSelect || !rankSelect || !promptInput) return;

  Store.setAgentOverride(agentId, {
    provider:     providerSelect.value,
    model:        modelSelect.value,
    rank:         rankSelect.value,
    systemPrompt: promptInput.value,
    apiKey:       apiKeyInput ? apiKeyInput.value : '',
  });

  renderAgentList();
  showToast(`${agentsData.find(a => a.id === agentId)?.name} 설정이 저장되었습니다`);
};

/** 토스트 메시지 */
const showToast = (message) => {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = `✓ ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
};

document.addEventListener('DOMContentLoaded', init);
