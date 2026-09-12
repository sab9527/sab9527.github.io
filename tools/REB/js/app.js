(() => {
  const E = window.RECOMB_ENGINE;
  const RULES = window.RECOMB_RULES;
  const SH = window.RECOMB_SHARE;
  const attrOptions = (RULES.attrOrder || Object.keys(RULES.attrLabels || {})).map(a => [a, RULES.attrLabels[a]]);
  const attrHints = RULES.attrHints || {};
  const attrLabel = value => (RULES.attrLabels || {})[value] || value;
  const attrOf = mod => RULES.legacyToAttr(mod);
  // 已移除的「機制掉落」：舊存檔／舊分享連結若還帶著，一律回到原生
  const LEGACY_KINDS = { mechanic: 'normal' };
  const defaultItem = label => {
    // 預設名稱帶上裝備代號（A-前綴 1／B-前綴 1），兩件裝備預設不會同名
    const tag = String(label).replace('Item ', '');
    return {
      label,
      prefixes: [0, 1, 2].map(i => ({ name: `${tag}-前綴 ${i + 1}`, kind: 'normal', nnn: 'none', enabled: i < 1 })),
      suffixes: [0, 1, 2].map(i => ({ name: `${tag}-後綴 ${i + 1}`, kind: 'normal', nnn: 'none', enabled: i < 1 }))
    };
  };
  let state = { items: [defaultItem('Item A'), defaultItem('Item B')] };
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
  // ---------- 配色主題 ----------
  const THEME_KEY = 'recomb.theme';
  const THEMES = ['emerald', 'graphite', 'ember'];
  function applyTheme(name) {
    const theme = THEMES.includes(name) ? name : 'emerald';
    document.documentElement.dataset.theme = theme;
    qsa('.theme-dot').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme)));
    // 手機瀏覽器列的顏色跟著配色走
    const meta = qs('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0f0f0f');
    try { localStorage.setItem(THEME_KEY, theme); } catch (error) { /* 無痕模式等情形忽略 */ }
  }
  qsa('.theme-dot').forEach(btn => btn.addEventListener('click', () => applyTheme(btn.dataset.theme)));
  applyTheme(document.documentElement.dataset.theme);
  // ---------- 本機儲存 / 即時運算 ----------
  const SIM_KEY = 'recomb.simulate.v1';
  let showAllCombos = false;
  const readStore = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (error) { return fallback; }
  };
  const writeStore = (key, value) => {
    try {
      if (value === null || value === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (error) { /* 無痕模式等情形忽略 */ }
  };
  const debounce = (fn, wait) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); }; };
  // 舊資料正規化：{kind, nnn}（含已移除的 mechanic、舊布林 exclusive、
  // 以及舊 UI 允許的「限定＋NNN」並存）一律收斂成單一存在屬性再存回。
  // NNN 優先：限定必然兩邊都存在，有 NNN 標記就按 NNN 算。
  const sanitizeMod = (raw, fallback) => {
    if (!raw || typeof raw !== 'object') return fallback;
    const rawKind = LEGACY_KINDS[raw.kind] || raw.kind;
    const attr = RULES.legacyToAttr({
      kind: rawKind === 'normal' || rawKind === 'exclusive' ? rawKind : (raw.exclusive ? 'exclusive' : undefined),
      exclusive: raw.exclusive,
      nnn: raw.nnn
    });
    const leg = RULES.attrToLegacy(attr);
    return {
      name: typeof raw.name === 'string' ? raw.name : fallback.name,
      enabled: !!raw.enabled,
      kind: leg.kind,
      nnn: leg.nnn
    };
  };
  const sanitizeItem = (raw, label) => {
    const fallback = defaultItem(label);
    if (!raw || typeof raw !== 'object') return fallback;
    ['prefixes', 'suffixes'].forEach(side => fallback[side].forEach((mod, i) => {
      Object.assign(mod, sanitizeMod(raw[side] && raw[side][i], mod));
    }));
    return fallback;
  };
  const storedSim = readStore(SIM_KEY, null);
  state = { items: [sanitizeItem(storedSim && storedSim.items && storedSim.items[0], 'Item A'), sanitizeItem(storedSim && storedSim.items && storedSim.items[1], 'Item B')] };
  // 分享連結優先於本機儲存：#simulate?s=邊碼（讀不到就沿用本機設定，啟動後再提示）
  let sharedCodeError = false;
  (() => {
    const m = (location.hash || '').match(/[?&#]s=([A-Za-z0-9\-_]+)/);
    if (!m) return;
    const dec = SH.decode(m[1]);
    if (!dec) { sharedCodeError = true; return; }
    state = { items: [sanitizeItem(dec.items[0], 'Item A'), sanitizeItem(dec.items[1], 'Item B')] };
  })();
  const persistSimulate = () => writeStore(SIM_KEY, { items: state.items });
  const anyModEnabled = () => state.items.some(item => [...item.prefixes, ...item.suffixes].some(mod => mod.enabled));
  const scheduleCalc = debounce(() => { if (anyModEnabled()) calculate(); }, 140);

  function renderEditors() {
    qs('#items-editor').innerHTML = state.items.map((item, itemIndex) => `
      <article class="item-card" data-item="${itemIndex}">
        <div class="item-card-head"><h3>${item.label}</h3><span class="item-base-tag">結果有 50% 選中這件基底</span></div>
        ${renderSlots(item, itemIndex, 'prefixes', '前綴')}
        ${renderSlots(item, itemIndex, 'suffixes', '後綴')}
      </article>`).join('');
    qsa('[data-action="enabled"]').forEach(el => el.addEventListener('change', e => updateSlot(e, 'enabled')));
    qsa('[data-action="name"]').forEach(el => el.addEventListener('input', e => updateSlot(e, 'name')));
    qsa('[data-action="attr"]').forEach(el => el.addEventListener('change', e => updateSlot(e, 'attr')));
    renderInputNotes();
  }
  function renderSlots(item, itemIndex, side, label) {
    return `<div class="slot-section"><div class="slot-label">${label}</div>${item[side].map((mod, slotIndex) => {
      const attr = attrOf(mod);
      const attrTitle = attrHints[attr] || '';
      return `
      <div class="slot-row attr-${attr}" data-attr="${attr}">
        <input type="checkbox" data-action="enabled" data-side="${side}" data-slot="${slotIndex}" ${mod.enabled ? 'checked' : ''} aria-label="啟用 ${label} ${slotIndex + 1}">
        <div class="slot-fields">
          <div class="slot-line name-line">
            <input type="text" data-action="name" data-side="${side}" data-slot="${slotIndex}" value="${escapeHtml(mod.name)}" ${mod.enabled ? '' : 'disabled'} aria-label="${label} ${slotIndex + 1} 名稱">
          </div>
          <div class="slot-line">
            <span class="select-wrap">
              <select class="attr-select" data-action="attr" data-side="${side}" data-slot="${slotIndex}" title="${attrTitle}" ${!mod.enabled ? 'disabled' : ''} aria-label="${label} ${slotIndex + 1} 存在屬性">${attrOptions.map(([value, text]) => `<option value="${value}" ${attr === value ? 'selected' : ''}>${text}</option>`).join('')}</select>
              <span class="select-face" aria-hidden="true">${attrLabel(attr)}</span>
            </span>
          </div>
        </div>
      </div>`;
    }).join('')}</div>`;
  }
  function updateSlot(e, key) {
    const card = e.target.closest('.item-card');
    const item = state.items[+card.dataset.item];
    const slot = item[e.target.dataset.side][+e.target.dataset.slot];
    if (key === 'attr') {
      // 存在屬性是唯一的真實來源：直接寫回引擎的 {kind, nnn}
      const leg = RULES.attrToLegacy(e.target.value);
      slot.kind = leg.kind;
      slot.nnn = leg.nnn;
    } else {
      slot[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    }
    // 存在屬性改變時，同步顏色標示與下拉外觀文字
    if (key === 'attr') {
      const row = e.target.closest('.slot-row');
      const attr = attrOf(slot);
      if (row) {
        row.classList.remove('attr-native', 'attr-exclusive', 'attr-singleA', 'attr-singleB', 'attr-double');
        row.classList.add(`attr-${attr}`);
        row.dataset.attr = attr;
        const wrap = e.target.closest('.select-wrap');
        if (wrap) wrap.querySelector('.select-face').textContent = attrLabel(attr);
        e.target.title = attrHints[attr] || '';
      }
    }
    if (key === 'enabled') renderEditors();
    persistSimulate();
    clearShareParam();
    scheduleCalc();
    renderInputNotes();
  }
  // 輸入備註（#input-warning）：只提醒、不阻擋，真正無效的輸入由 #validation 紅字擋下
  // 1) 引擎提醒：例如某條詞綴同時標了限定與「兩邊都不存在」（遊戲裡結果可能更差）
  // 2) 同名詞綴：同一側出現同名時，引擎視為同一條（組合被排除、機率合併顯示）
  function renderInputNotes() {
    const v = E.validate(state.items[0], state.items[1]);
    const dupList = v.duplicates || [];
    const dupes = new Set(dupList.map(d => `${d.side}|${d.name.toLowerCase()}`));
    qsa('.item-card').forEach((card, itemIndex) => qsa('.slot-row', card).forEach((row, rowIndex) => {
      const isPrefix = rowIndex < 3;
      const mod = state.items[itemIndex][isPrefix ? 'prefixes' : 'suffixes'][rowIndex % 3];
      const dup = !!mod.enabled && dupes.has(`${isPrefix ? '前綴' : '後綴'}|${String(mod.name || '').trim().toLowerCase()}`);
      row.classList.toggle('dup', dup);
      const input = row.querySelector('[data-action=name]');
      if (input) input.title = dup ? '與另一件（或同一件）的詞綴同名：工具會把它們當成同一條詞綴' : '';
    }));
    const notes = [...(v.warnings || [])];
    if (dupList.length) {
      const groups = [...new Set(dupList.map(d => d.side))].join('、');
      const names = [...new Set(dupList.map(d => d.name))].map(n => `「${n}」`).join('、');
      notes.push(`${groups}有同名詞綴 ${names}：工具會把它們當成同一條詞綴，同一側最多只存在一條，機率會合併、合計也可能低於 100%（重複的那條無法同時佔兩格）。如果它們其實是不同的詞綴，請改成不同名稱；如果本來就是同一條詞綴（或彼此互斥、不可能同時存在），取名相同即可。`);
    }
    const box = qs('#input-warning');
    if (!box) return;
    if (!notes.length) { box.className = 'validation'; box.textContent = ''; return; }
    box.className = 'validation warn';
    box.textContent = notes.join(' ');
  }
  function escapeHtml(s) { return String(s).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  function fmt(n) { return `${(n * 100).toFixed(1).replace('.0', '')}%`; }
  function calculate() {
    const result = E.calculate(...state.items);
    const validation = qs('#validation');
    if (!result.validation.ok) {
      validation.className = 'validation error';
      validation.textContent = result.validation.message;
      qs('#result-content').innerHTML = '';
      return;
    }
    validation.className = 'validation ok';
    validation.textContent = result.special ? '輸入有效：符合 1p1e + 1e1s 特例。' : '輸入有效：可以進行重組。';
    if (result.special) {
      qs('#result-content').className = 'result-content';
      qs('#result-content').innerHTML = `<div class="result-summary"><div class="summary-box wide"><span>1 前綴 1 後綴</span><strong>≥ 33.3%</strong></div></div><div class="result-block"><h3>1p1e + 1e1s 特例</h3><p class="rule-note">先填的那一側抽中限定之後，另一側池中的限定會被剔除；因為要留幾條已經先決定，部分結果會被強制導向剩下的那條一般詞綴。實測常見成功率在 50% 以上，但精確值取決於詞綴權重，目前無法給出固定數字。</p></div>`;
      return;
    }
    // 整體結果分布：前綴 × 後綴 的對照表（取代原本的條列）
    const cells = Object.entries(result.all).map(([label, p]) => {
      const m = label.match(/^(\d+) 前綴 (\d+) 後綴$/);
      return m ? { p: +m[1], s: +m[2], probability: p } : null;
    }).filter(Boolean);
    const pVals = [...new Set(cells.map(c => c.p))].sort((a, b) => b - a);
    const sVals = [...new Set(cells.map(c => c.s))].sort((a, b) => a - b);
    const best = cells.reduce((a, b) => (b.probability > (a ? a.probability : -1) ? b : a), null);
    const cellStyle = probability => {
      const ratio = best && best.probability ? probability / best.probability : 0;
      const alpha = (0.05 + 0.32 * ratio).toFixed(3);
      const shade = (alpha * 0.6).toFixed(3);
      return ` style="background:linear-gradient(180deg,rgba(101,197,165,${alpha}),rgba(101,197,165,${shade}));color:${ratio > 0.5 ? '#c8f2e2' : '#cfdcd4'}"`;
    };
    const distMatrix = (pVals.length && sVals.length) ? `
      <table class="dist-matrix">
        <thead><tr><th></th>${sVals.map(s => `<th>${s} 後綴</th>`).join('')}</tr></thead>
        <tbody>${pVals.map(p => `<tr><th>${p} 前綴</th>${sVals.map(s => {
          const cell = cells.find(c => c.p === p && c.s === s);
          if (!cell) return '<td class="empty">—</td>';
          const isBest = best && cell.p === best.p && cell.s === best.s;
          return `<td class="${isBest ? 'best' : ''}"${cellStyle(cell.probability)}>${fmt(cell.probability)}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table>` : '';
    // 每個基底各自的占比條
    const COUNT_COLORS = ['#6b7a72', '#3f7fb8', '#35a58e', '#b8f04f'];
    const COUNT_TEXT = ['#a9b6ae', '#9fc9ec', '#8fe0c8', '#e2f9b4'];
    const stackBar = odds => {
      const segs = odds.map((v, i) => v > 0 ? `<i style="width:${v * 100}%;background:${COUNT_COLORS[i]}"></i>` : '').join('');
      const legend = odds.map((v, i) => v > 0 ? `<span class="seg" style="color:${COUNT_TEXT[i]}"><b style="background:${COUNT_COLORS[i]}"></b>${i} 條 ${fmt(v)}</span>` : '').join('');
      return `<div class="stack-bar">${segs}</div><div class="stack-legend">${legend}</div>`;
    };
    const baseColumn = base => `
      <div class="base-col ${base.base === 'A' ? 'col-a' : 'col-b'}">
        <h4>${base.base === 'A' ? '若選中 Item A 基底' : '若選中 Item B 基底'}</h4>
        ${base.rule === '1p1s'
          ? '<p class="rule-note">1 前 1 後 特例：1 前綴 1 後綴／只有前綴／只有後綴各 1/3</p>'
          : `<div class="side-block"><span class="side-name">前綴（池 ${base.prefix.pool}）</span>${stackBar(base.prefix.odds)}</div><div class="side-block"><span class="side-name">後綴（池 ${base.suffix.pool}）</span>${stackBar(base.suffix.odds)}</div>`}
      </div>`;
    // 具體組合：每個基底各自一欄；同名組合在該欄內合併
    const combosByBase = result.bases.map(base => {
      const map = new Map();
      base.outcomes.forEach(o => {
        const each = (o.probability / Math.max(1, o.combos.length)) / 2;
        o.combos.forEach(combo => {
          const key = combo.map(m => m.name).slice().sort().join(' | ');
          const rec = map.get(key) || { items: combo.map((m, idx) => ({ name: m.name, exclusive: E.isExclusive(m), nnn: m.nnn || 'none', side: idx < (o.p || 0) ? 'prefixes' : 'suffixes' })), probability: 0 };
          rec.probability += each;
          map.set(key, rec);
        });
      });
      return [...map.values()].sort((a, b) => b.probability - a.probability);
    });
    const enabledMods = [...state.items[0].prefixes, ...state.items[0].suffixes, ...state.items[1].prefixes, ...state.items[1].suffixes].filter(m => m.enabled);
    // 會改變結果的（限定／非原生）才觸發「具體可能組合」區塊
    const resultChangingMods = enabledMods.filter(m => E.isExclusive(m) || (m.nnn && m.nnn !== 'none'));
    const modChip = m => {
      const variant = E.isExclusive(m) ? 'excl' : (m.nnn && m.nnn !== 'none') ? 'nnn' : '';
      return `<span class="mod-name ${variant}">${escapeHtml(m.name)}</span>`;
    };
    // 預設只顯示機率 ≥ 10% 的組合；若只有一個達標，往下取到明顯斷層為止
    const COMBO_FLOOR = 0.1;
    const COMBO_CAP = 20;
    const visibleCombos = rows => {
      if (showAllCombos) return rows.slice(0, 60);
      const base = rows.filter(r => r.probability >= COMBO_FLOOR);
      if (base.length >= 2) return base.slice(0, COMBO_CAP);
      if (!rows.length) return rows;
      const cutoff = rows[0].probability * 0.3;
      const extended = rows.filter(r => r.probability >= cutoff);
      return (extended.length >= 2 ? extended : rows.slice(0, Math.min(2, rows.length))).slice(0, COMBO_CAP);
    };
    const listed = combosByBase.map(rows => ({ rows: visibleCombos(rows), total: rows.length }));
    const comboLines = row => {
      const chip = m => `<span class="combo-mod">${modChip(m)}</span>`;
      const prefixes = row.items.filter(i => i.side === 'prefixes');
      const suffixes = row.items.filter(i => i.side === 'suffixes');
      return `<span class="combo-mods">${prefixes.map(chip).join('')}${prefixes.length && suffixes.length ? '<span class="combo-split" aria-hidden="true"></span>' : ''}${suffixes.map(chip).join('')}</span>`;
    };
    const comboColumn = (base, entry) => `
      <div class="base-col ${base.base === 'A' ? 'col-a' : 'col-b'}">
        <h4>${base.base === 'A' ? '若選中 Item A 基底' : '若選中 Item B 基底'}</h4>
        ${entry.rows.length
          ? `<div class="outcome-list combo-list">${entry.rows.map(row => `<div class="outcome">${comboLines(row)}<strong>約 ${fmt(row.probability)}</strong></div>`).join('')}</div>`
          : '<p class="result-footnote">這個基底沒有可列出的組合。</p>'}
      </div>`;
    const fate = resultChangingMods.map(m => {
      const parts = [];
      if (m.nnn === 'both') parts.push('雙邊 NNN（兩個基底都不存在）');
      else if (m.nnn === 'A') parts.push('單邊 NNN（只存在 B 基底）');
      else if (m.nnn === 'B') parts.push('單邊 NNN（只存在 A 基底）');
      if (E.isExclusive(m)) parts.push('限定（成品最多存在 1 條）');
      return `<span>${escapeHtml(m.name)}：${parts.join('、')}</span>`;
    }).join('');
    const hiddenCombos = listed.reduce((sum, entry) => sum + (entry.total - entry.rows.length), 0);
    const comboBlock = resultChangingMods.length
      ? `<div class="result-block"><h3>具體可能組合</h3><div class="base-columns">${result.bases.map((base, i) => comboColumn(base, listed[i])).join('')}</div>${hiddenCombos > 0 || showAllCombos ? `<button class="ghost-button" id="toggle-combos">${showAllCombos ? '收起機率較少的結果' : `顯示機率較少結果（還有 ${hiddenCombos} 種）`}</button>` : ''}<div class="inline-help stacked"><strong>特殊詞綴的影響</strong><div class="fate-list">${fate}</div></div></div>`
      : `<p class="result-footnote">這組設定沒有用到限定或非原生且非限定詞綴；可能組合只差在基底或重複實例，因此省略。</p>`;
    qs('#result-content').className = 'result-content';
    qs('#result-content').innerHTML = `<div class="result-block dist-block"><h3>整體結果分布</h3>${distMatrix}</div><div class="base-columns">${result.bases.map(baseColumn).join('')}</div>${comboBlock}`;
    persistSimulate();
  }
  function initNav() {
    const activate = page => {
      qsa('.nav-button').forEach(b => b.classList.toggle('active', b.dataset.page === page));
      qsa('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
    };
    qsa('.nav-button').forEach(button => button.addEventListener('click', () => {
      const page = button.dataset.page;
      activate(page);
      history.replaceState(null, '', `#${page}`);
    }));
    const hm = (location.hash || '').match(/^#([A-Za-z-]+)/);
    const initial = hm ? hm[1] : '';
    activate(['simulate', 'transfer', 'explain'].includes(initial) ? initial : 'simulate');
  }
  // 使用者一改動，網址上的分享參數就失效（避免舊邊碼誤導），下次按分享會重新產生
  function clearShareParam() {
    if (/[?&#]s=/.test(location.hash)) history.replaceState(null, '', '#simulate');
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) { /* file:// 或無權限時走備用 */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const done = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!done;
    } catch (error) {
      return false;
    }
  }
  qs('#share-button').addEventListener('click', async () => {
    const code = SH.encode(state.items);
    const url = SH.pageUrl('simulate', code, location.href);
    history.replaceState(null, '', `#simulate?s=${code}`);
    const done = await copyText(url);
    const box = qs('#validation');
    box.className = 'validation ok';
    box.textContent = done
      ? '分享連結已複製，別人打開就會看到同樣的設定。'
      : '自動複製失敗，網址列已更新為分享連結，請手動複製。';
  });
  const importDialog = qs('#import-dialog');
  const closeImport = () => {
    if (importDialog.close) importDialog.close();
    else importDialog.removeAttribute('open');
  };
  qs('#import-button').addEventListener('click', () => {
    qs('#import-text').value = '';
    qs('#import-error').textContent = '';
    if (importDialog.showModal) importDialog.showModal();
    else importDialog.setAttribute('open', '');
  });
  qs('#import-cancel').addEventListener('click', closeImport);
  qs('#import-confirm').addEventListener('click', () => {
    const dec = SH.decode(qs('#import-text').value);
    if (!dec) {
      qs('#import-error').textContent = '讀不到這個分享，請確認貼的是完整的分享連結或邊碼。';
      return;
    }
    state.items = [sanitizeItem(dec.items[0], 'Item A'), sanitizeItem(dec.items[1], 'Item B')];
    showAllCombos = false;
    renderEditors();
    persistSimulate();
    calculate();
    closeImport();
    // 網址換成這組設定的分享連結，重新整理也不會丟
    history.replaceState(null, '', `#simulate?s=${SH.encode(state.items)}`);
  });
  qs('#reset-button').addEventListener('click', () => {
    state.items = [defaultItem('Item A'), defaultItem('Item B')];
    showAllCombos = false;
    writeStore(SIM_KEY, null);
    clearShareParam();
    renderEditors();
    qs('#validation').className = 'validation';
    qs('#validation').textContent = '';
    const content = qs('#result-content');
    content.className = 'result-content empty-state';
    content.innerHTML = '<h3>左邊填好詞綴，這裡就會算出機率</h3>'
      + '<p>會列出結果基底的 50／50 分配、這一側留幾條詞綴的分布，以及兩件素材的具體組合。</p>';
  });
  qs('#result-content').addEventListener('click', e => {
    if (e.target.closest('#toggle-combos')) { showAllCombos = !showAllCombos; calculate(); }
  });

  initNav();
  renderEditors();
  if (anyModEnabled()) calculate();
  if (sharedCodeError) {
    const v = qs('#validation');
    v.className = 'validation error';
    v.textContent = '分享連結讀取失敗，已改用本機儲存的設定。請確認連結是完整的。';
  }
  // 名詞定義：模擬頁按鈕開啟的浮窗，內容與講解頁 #defs-section 同一張表（clone，單一來源）
  const defsDialog = qs('#defs-dialog');
  const closeDefs = () => {
    if (!defsDialog) return;
    if (defsDialog.close) defsDialog.close();
    else defsDialog.removeAttribute('open');
  };
  qs('#defs-button').addEventListener('click', () => {
    const src = qs('#defs-section');
    const body = qs('#defs-dialog-body');
    if (src && body) body.innerHTML = src.innerHTML;
    if (defsDialog.showModal) defsDialog.showModal();
    else if (defsDialog) defsDialog.setAttribute('open', '');
  });
  qs('#defs-close').addEventListener('click', closeDefs);
  if (defsDialog) defsDialog.addEventListener('click', e => { if (e.target === defsDialog) closeDefs(); });
  // 背景特效開關（右上）：禁用後停掉 RAF 並隱藏 canvas，選擇記住
  const bgBtn = qs('#bg-toggle');
  const syncBgBtn = () => {
    if (!bgBtn || !window.SACRED_BG) return;
    const on = !!window.SACRED_BG.enabled;
    bgBtn.textContent = on ? '關閉背景特效' : '開啟背景特效';
    bgBtn.setAttribute('aria-pressed', String(on));
  };
  if (bgBtn) bgBtn.addEventListener('click', () => {
    const cfg = window.SACRED_BG || {};
    cfg.enabled = !cfg.enabled;
    try { localStorage.setItem('recomb.bg', cfg.enabled ? '1' : '0'); } catch (e) { /* 忽略 */ }
    if (cfg.enabled && cfg._start) cfg._start();
    if (!cfg.enabled && cfg._stop) cfg._stop();
    syncBgBtn();
  });
  syncBgBtn();
  // 對外極簡 API（自動化測試與嵌入頁面用）：立刻重算、讀出目前狀態
  window.RECOMB_APP = { recalculate: calculate, getState: () => state };
})();
