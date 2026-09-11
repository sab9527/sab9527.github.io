(() => {
  const E = window.RECOMB_ENGINE;
  const RULES = window.RECOMB_RULES;
  const nnnOptions = Object.entries(RULES.nnnLabels);
  const defaultItem = (label) => ({
    label,
    prefixes: [0, 1, 2].map(i => ({ name: `前綴 ${i + 1}`, exclusive: false, nnn: 'none', enabled: i < 1 })),
    suffixes: [0, 1, 2].map(i => ({ name: `後綴 ${i + 1}`, exclusive: false, nnn: 'none', enabled: i < 1 }))
  });
  let state = { items: [defaultItem('Item A'), defaultItem('Item B')] };
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];

  function renderEditors() {
    qs('#items-editor').innerHTML = state.items.map((item, itemIndex) => `
      <article class="item-card" data-item="${itemIndex}">
        <div class="item-card-head"><h3>${item.label}</h3><span class="item-base-tag">結果有 50% 選中這件基底</span></div>
        ${renderSlots(item, itemIndex, 'prefixes', '前綴')}
        ${renderSlots(item, itemIndex, 'suffixes', '後綴')}
      </article>`).join('');
    qsa('[data-action="enabled"]').forEach(el => el.addEventListener('change', e => updateSlot(e, 'enabled')));
    qsa('[data-action="name"]').forEach(el => el.addEventListener('input', e => updateSlot(e, 'name')));
    qsa('[data-action="exclusive"]').forEach(el => el.addEventListener('change', e => updateSlot(e, 'exclusive')));
    qsa('[data-action="nnn"]').forEach(el => el.addEventListener('change', e => updateSlot(e, 'nnn')));
  }
  function renderSlots(item, itemIndex, side, label) {
    return `<div class="slot-section"><div class="slot-label">${label}</div>${item[side].map((mod, slotIndex) => `
      <div class="slot-row">
        <input type="checkbox" data-action="enabled" data-side="${side}" data-slot="${slotIndex}" ${mod.enabled ? 'checked' : ''} aria-label="啟用 ${label} ${slotIndex + 1}">
        <div class="slot-fields">
          <input type="text" data-action="name" data-side="${side}" data-slot="${slotIndex}" value="${escapeHtml(mod.name)}" ${mod.enabled ? '' : 'disabled'} aria-label="${label} ${slotIndex + 1} 名稱">
          <div class="slot-flags">
            <label class="flag-exclusive"><input type="checkbox" data-action="exclusive" data-side="${side}" data-slot="${slotIndex}" aria-label="${label} ${slotIndex + 1} 限定詞" ${mod.exclusive ? 'checked' : ''} ${mod.enabled ? '' : 'disabled'}>限定詞</label>
            <select class="nnn-select" data-action="nnn" data-side="${side}" data-slot="${slotIndex}" ${mod.enabled ? '' : 'disabled'} aria-label="${label} ${slotIndex + 1} 非原生對象">${nnnOptions.map(([value, text]) => `<option value="${value}" ${mod.nnn === value ? 'selected' : ''}>${text}</option>`).join('')}</select>
          </div>
        </div>
      </div>`).join('')}</div>`;
  }
  function updateSlot(e, key) {
    const card = e.target.closest('.item-card');
    const item = state.items[+card.dataset.item];
    const slot = item[e.target.dataset.side][+e.target.dataset.slot];
    slot[key] = key === 'enabled' ? e.target.checked : key === 'exclusive' ? e.target.checked : e.target.value;
    if (key === 'enabled') renderEditors();
  }
  function escapeHtml(s) { return String(s).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  function fmt(n) { return `${(n * 100).toFixed(1).replace('.0', '')}%`; }
  function calculate() {
    const result = E.calculate(...state.items);
    const validation = qs('#validation');
    if (!result.validation.ok) {
      validation.className = 'validation error';
      validation.textContent = result.validation.message;
      qs('#result-state').textContent = '輸入有誤';
      qs('#result-content').innerHTML = '';
      return;
    }
    validation.className = 'validation ok';
    validation.textContent = result.special ? '輸入有效：符合 1p1e + 1e1s 特例。' : '輸入有效：可以進行重組。';
    qs('#result-state').textContent = '已完成計算';
    if (result.special) {
      qs('#result-content').className = 'result-content';
      qs('#result-content').innerHTML = `<div class="result-summary"><div class="summary-box wide"><span>1 前綴 1 後綴</span><strong>≥ 33.3%</strong></div></div><div class="result-block"><h3>1p1e + 1e1s 特例</h3><p class="rule-note">先填的那一側抽中限定詞之後，另一側池中的限定詞會被剔除；因為要留幾條已經先決定，部分結果會被強制導向剩下的那條一般詞綴。實測常見成功率在 50% 以上，但精確值取決於詞綴權重，目前無法給出固定數字。</p></div>`;
      return;
    }
    const full = (result.bases[0].full + result.bases[1].full) / 2;
    const outcomeEntries = Object.entries(result.all).sort((a, b) => b[1] - a[1]);
    const bars = (base) => `<div class="result-block"><h3>${base.base === 'A' ? '若選中 Item A 基底' : '若選中 Item B 基底'}｜前綴池 ${base.prefix.pool}、後綴池 ${base.suffix.pool}</h3>${base.rule === '1p1s' ? '<p class="rule-note">這組是「1 條前綴 + 1 條後綴」的特例：1 前綴 1 後綴、只有前綴、只有後綴各 1/3。</p>' : `<div>${sideBars(base.prefix.odds, '前綴')}</div><div>${sideBars(base.suffix.odds, '後綴')}</div>`}</div>`;
    const outcomes = outcomeEntries.map(([label, probability]) => `<div class="outcome"><span>${label}</span><strong>${fmt(probability)}</strong></div>`).join('');
    const concrete = result.bases.flatMap(base => base.outcomes.flatMap(o => o.combos.map(combo => ({ base: base.base, label: combo.map(m => m.name).join(' + '), probability: (o.probability / Math.max(1, o.combos.length)) / 2 }))));
    const concreteRows = concrete.slice().sort((a, b) => b.probability - a.probability).slice(0, 24).map(row => `<div class="outcome"><span>${row.label}<small class="combo-base">${row.base === 'A' ? 'A 基底' : 'B 基底'}</small></span><strong>約 ${fmt(row.probability)}</strong></div>`).join('');
    qs('#result-content').className = 'result-content';
    qs('#result-content').innerHTML = `<div class="result-summary"><div class="summary-box"><span>整體 3 前綴 3 後綴</span><strong>${fmt(full)}</strong></div><div class="summary-box"><span>可能結果種類</span><strong>${outcomeEntries.length}</strong></div></div>${result.bases.map(bars).join('')}<div class="result-block"><h3>整體前綴／後綴分布</h3><div class="outcome-list">${outcomes}</div></div><div class="result-block"><h3>具體可能組合（編號詞綴）</h3><div class="outcome-list">${concreteRows || '<p class="result-footnote">目前設定沒有可列出的具體組合。</p>'}</div></div>`;
  }
  function sideBars(odds, label) { return `<div class="bar-row"><span>${label}</span><div class="bar"><i style="width:${Math.max(...odds) * 100}%"></i></div><span>${odds.map((n, i) => n ? `${i}條 ${fmt(n)}` : '').filter(Boolean).join('／')}</span></div>`; }
  // ---------- 推薦路線（目標驅動規劃器） ----------
  const PLANNER = window.RECOMB_PLANNER;
  const KIND_OPTIONS = Object.entries(RULES.kindLabels || {
    normal: '普通', exclusive: '限定詞', nnnA: '非原生（A）', nnnB: '非原生（B）', nnnBoth: '非原生（雙方）'
  });
  let goal = {
    baseMode: 'same',
    prefixes: [0, 1, 2].map(i => ({ on: false, name: `前綴 ${i + 1}`, kind: 'normal' })),
    suffixes: [0, 1, 2].map(i => ({ on: false, name: `後綴 ${i + 1}`, kind: 'normal' }))
  };

  function renderGoal() {
    const rows = (side, label) => goal[side].map((mod, i) => `
      <div class="goal-row">
        <input type="checkbox" data-goal="on" data-side="${side}" data-slot="${i}" ${mod.on ? 'checked' : ''} aria-label="要這個${label} ${i + 1}">
        <input type="text" data-goal="name" data-side="${side}" data-slot="${i}" value="${escapeHtml(mod.name)}" aria-label="${label} ${i + 1} 名稱">
        <select data-goal="kind" data-side="${side}" data-slot="${i}" aria-label="${label} ${i + 1} 類型">${KIND_OPTIONS.map(([v, t]) => `<option value="${v}" ${mod.kind === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
      </div>`).join('');
    qs('#plan-prefixes').innerHTML = rows('prefixes', '前綴');
    qs('#plan-suffixes').innerHTML = rows('suffixes', '後綴');
    qsa('[data-goal]').forEach(el => el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', e => {
      const { goal: prop, side, slot } = e.target.dataset;
      goal[side][+slot][prop] = prop === 'on' ? e.target.checked : e.target.value;
    }));
    qs('#plan-base').value = goal.baseMode;
  }

  const pctSmart = n => {
    if (!isFinite(n)) return '—';
    const v = n * 100;
    if (v >= 10) { const r = Math.round(v * 10) / 10; return `${Math.abs(r - Math.round(r)) < 0.05 ? Math.round(r) : r.toFixed(1)}%`; }
    if (v >= 1) return `${v.toFixed(1)}%`;
    if (v >= 0.1) return `${v.toFixed(2)}%`;
    return `${v.toFixed(3)}%`;
  };
  const num = n => (!isFinite(n) ? '—' : n >= 10 ? Math.round(n).toLocaleString() : n.toFixed(1));
  const kindText = k => (KIND_OPTIONS.find(([v]) => v === k) || ['', '普通'])[1];

  function runPlan() {
    const target = {
      baseMode: goal.baseMode,
      prefixes: goal.prefixes.filter(m => m.on).map(m => ({ name: m.name, kind: m.kind })),
      suffixes: goal.suffixes.filter(m => m.on).map(m => ({ name: m.name, kind: m.kind }))
    };
    const r = PLANNER.plan(target);
    const output = qs('#plan-output');
    output.className = 'result-content';
    if (!r.feasibility.ok) {
      qs('#plan-state').textContent = '目標有問題';
      output.className = 'result-content';
      output.innerHTML = `<div class="validation error">${r.feasibility.issues.join('<br>')}</div>`;
      return;
    }
    qs('#plan-state').textContent = '已規劃';
    const warn = r.feasibility.issues.length ? `<div class="validation error">${r.feasibility.issues.join('<br>')}</div>` : '';
    const hints = r.feasibility.hints.length ? `<div class="inline-help"><strong>準備原則</strong><span>${r.feasibility.hints.join('<br>')}</span></div>` : '';
    if (r.singleAffix) {
      output.innerHTML = `${warn}${hints}<div class="route-card best"><div class="route-head"><div><h3>不需要重組</h3><p>目標只有一條詞綴，直接準備這個單詞綴素材即可。</p></div></div><div class="route-meta"><span>${r.leaves.map(l => `${l.side}：${l.name}（${kindText(l.kind)}）`).join('')}</span></div></div>`;
      return;
    }
    const stepTable = route => `<table class="step-table"><thead><tr><th>步驟</th><th>素材 A</th><th>素材 B</th><th>結果</th><th>成功率</th></tr></thead><tbody>${route.steps.map((s, i) => `<tr><td>第 ${i + 1} 步</td><td>${escapeHtml(s.a.text)}<small>${s.a.counts}</small></td><td>${escapeHtml(s.b.text)}<small>${s.b.counts}</small></td><td>${escapeHtml(s.result.text)}<small>${s.result.counts}</small></td><td class="pct">${pctSmart(s.probability)}</td></tr>`).join('')}</tbody></table>`;
    const routeCard = (route, rank) => `
      <article class="route-card ${rank === 0 ? 'best' : ''}">
        <div class="route-head">
          <div><h3>${rank === 0 ? '建議路線' : `替代路線 ${rank + 1}`}｜${route.stepCount} 步完成</h3><p>最後一步：${escapeHtml(route.finalStep.a.text)} ＋ ${escapeHtml(route.finalStep.b.text)} → ${escapeHtml(route.finalStep.result.text)}</p></div>
          <strong class="route-rate">${num(route.leaves)}<small>個單詞綴素材</small></strong>
        </div>
        <div class="route-meta">
          <span>預估重組 ${num(route.attempts)} 次</span>
          <span>一次到底 ${pctSmart(route.probability)}</span>
          <span>每一步成功率都 ≥ ${pctSmart(PLANNER.MIN_STEP_ODDS)}</span>
        </div>
        ${stepTable(route)}
      </article>`;
    const single = r.singleStep.length ? `
      <div class="result-block"><h3>只做最後一步（兩件素材另外準備）</h3>
        <table class="step-table"><thead><tr><th>成功率</th><th>素材 A</th><th>素材 B</th><th>整條路線預估素材</th></tr></thead>
        <tbody>${r.singleStep.map(o => `<tr><td class="pct">${pctSmart(o.probability)}</td><td>${escapeHtml(o.a.text)}<small>${o.a.counts}</small></td><td>${escapeHtml(o.b.text)}<small>${o.b.counts}</small></td><td>${num(o.total)} 個</td></tr>`).join('')}</tbody></table>
        <p class="result-footnote">成功率是「這一步同時留下全部目標詞綴」的機率；但兩件素材本身還要做成上面列的樣子，所以整條路線的實際素材用量看「整條路線預估素材」。</p>
      </div>` : '';
    const leaves = r.leaves.length ? `
      <div class="result-block"><h3>要準備的單詞綴素材（建議路線）</h3>
        <div class="leaf-list">${r.leaves.map(l => `<span class="leaf">${l.side}：${escapeHtml(l.name)}${l.count > 1 ? ` ×${l.count}` : ''}<small>${kindText(l.kind)}</small></span>`).join('')}</div>
        <p class="result-footnote">單詞綴素材＝只有這一條詞綴的裝備（用改造石洗出來，或用精髓／面紗等來源取得）。限定詞素材只能從精髓、面紗、尊爵勢力、掘獄等來源取得。</p>
      </div>` : '';
    const sp = r.special;
    const specialBlock = sp ? `
      <div class="result-block"><h3>1p1e + 1e1s 特例${sp.applicable ? '（可以考慮，但只能用在不指定內容的中間件）' : '（不適用）'}</h3>
        ${sp.applicable ? `
          <p class="rule-note">觸發條件：兩件素材都只有 1 前綴 1 後綴、各帶 1 條限定詞、而且兩條限定詞分別落在前綴側與後綴側，全部原生（沒有非原生詞綴）。</p>
          <table class="step-table"><thead><tr><th>素材</th><th>前綴</th><th>後綴</th></tr></thead><tbody>
            <tr><td>Item A</td><td>${escapeHtml(sp.requirement.a.prefixes.join('、'))}</td><td>${escapeHtml(sp.requirement.a.suffixes.join('、'))}</td></tr>
            <tr><td>Item B</td><td>${escapeHtml(sp.requirement.b.prefixes.join('、'))}</td><td>${escapeHtml(sp.requirement.b.suffixes.join('、'))}</td></tr>
          </tbody></table>
          <p class="rule-note">結果一定落在「1 前綴 1 後綴」，機率 <strong>≥ ${pctSmart(sp.bound)}</strong>（實測常見 50% 以上，精確值取決於詞綴權重，目前無法給出固定數字）。但<strong>「剛好留下你指定的那兩條」的機率未知，而且不會高於這個數字</strong>，因為結果也可能留下墊檔的限定詞。</p>
          <p class="rule-note">建議：要精準指定詞綴 → 直接走上面的<strong>一般路線</strong>（${sp.generalRoute ? pctSmart(sp.generalRoute.probability) : '—'}，數量鎖定在你要的那兩條）。特例只適合做「不指定內容」的 1 前 1 後 中間件。</p>`
          : `<p class="rule-note">${escapeHtml(sp.reason)}</p>`}
      </div>` : '';
    output.innerHTML = `${warn}
      <div class="result-summary">
        <div class="summary-box"><span>建議路線步數</span><strong>${r.routes.length ? r.routes[0].stepCount : 0}</strong></div>
        <div class="summary-box"><span>預估單詞綴素材</span><strong>${r.routes.length ? num(r.routes[0].leaves) : '—'}</strong></div>
      </div>
      ${hints}
      ${r.routes.map((route, i) => routeCard(route, i)).join('')}
      ${single}
      ${leaves}
      ${specialBlock}
      <div class="inline-help"><strong>已略過</strong><span>單步成功率低於 ${pctSmart(PLANNER.MIN_STEP_ODDS)} 的組合不會列入推薦。</span></div>`;
  }

  function initNav() {
    qsa('.nav-button').forEach(button => button.addEventListener('click', () => {
      const page = button.dataset.page;
      qsa('.nav-button').forEach(b => b.classList.toggle('active', b === button));
      qsa('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
      history.replaceState(null, '', `#${page}`);
      if (page === 'recommend') renderRecommendations();
    }));
  }
  qs('#calculate-button').addEventListener('click', calculate);
  qs('#reset-button').addEventListener('click', () => {
    state.items = [defaultItem('Item A'), defaultItem('Item B')];
    renderEditors();
    qs('#validation').textContent = '';
    qs('#result-content').className = 'result-content empty-state';
    qs('#result-content').innerHTML = '<div class="empty-symbol">↗</div><h3>設定詞綴後開始計算</h3>';
    qs('#result-state').textContent = '等待輸入';
  });
  qs('#plan-button').addEventListener('click', runPlan);
  qs('#plan-base').addEventListener('change', e => { goal.baseMode = e.target.value; });
  qsa('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
    const preset = btn.dataset.preset;
    const set = (side, on, label) => goal[side].forEach((m, i) => {
      m.on = on.includes(i);
      m.name = `${label} ${i + 1}`;
      m.kind = 'normal';
    });
    if (preset === '3p3s') { set('prefixes', [0, 1, 2], '前綴'); set('suffixes', [0, 1, 2], '後綴'); }
    else if (preset === '3p2s') { set('prefixes', [0, 1, 2], '前綴'); set('suffixes', [0, 1], '後綴'); }
    else if (preset === '2p2s') { set('prefixes', [0, 1], '前綴'); set('suffixes', [0, 1], '後綴'); }
    else { set('prefixes', [], '前綴'); set('suffixes', [], '後綴'); }
    renderGoal();
    if (preset !== 'clear') runPlan();
  }));
  initNav();
  renderEditors();
  renderGoal();
})();
