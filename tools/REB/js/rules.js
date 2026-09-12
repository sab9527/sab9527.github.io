/* Rules are kept here so future balance/version changes stay out of UI code. */
window.RECOMB_RULES = {
  version: 'latest',
  // 池大小 -> [留 0 條, 1 條, 2 條, 3 條]
  sideOdds: {
    0: [1, 0, 0, 0],
    1: [0.41, 0.59, 0, 0],
    2: [0, 2 / 3, 1 / 3, 0],
    3: [0, 0.38, 0.52, 0.10],
    4: [0, 0.10, 0.59, 0.31],
    5: [0, 0, 0.43, 0.57],
    6: [0, 0, 0.28, 0.72]
  },
  // 詞綴存在屬性：UI 唯一暴露的分類（五選一）。
  // 原生＝兩邊都可能存在；限定＝兩邊都存在但成品最多一條；
  // 單邊 NNN＝基底限定（錯邊不存在但仍佔池）；雙邊 NNN＝兩邊都不存在，只佔池。
  attrLabels: {
    native: '原生',
    exclusive: '限定',
    singleA: '單邊 NNN（只存在 A 基底）',
    singleB: '單邊 NNN（只存在 B 基底）',
    double: '雙邊 NNN（兩邊都不存在）'
  },
  attrHints: {
    native: '原生：這條詞綴兩個基底都可能存在。',
    exclusive: '限定：神廟限定掉落詞、掘獄、部分精髓等來源的限定。成品最多存在一條；兩件素材合計通常也只能放一條。合成前建議先查證。',
    singleA: '單邊 NNN（基底限定）：選中 Item B 基底時這條不存在；它仍然佔用詞綴池。',
    singleB: '單邊 NNN（基底限定）：選中 Item A 基底時這條不存在；它仍然佔用詞綴池。',
    double: '雙邊 NNN：兩個基底都不存在（例如眾神殿之相），只佔用詞綴池一格。'
  },
  attrOrder: ['native', 'exclusive', 'singleA', 'singleB', 'double'],
  // 存在屬性 -> 引擎內部的 {kind, nnn}（注意 nnn 語意是反的：
  // nnn:'B' 表示在 B 基底上不存在，即「只存在 A 基底」）。
  attrToLegacy(attr) {
    switch (attr) {
      case 'exclusive': return { kind: 'exclusive', nnn: 'none' };
      case 'singleA': return { kind: 'normal', nnn: 'B' };
      case 'singleB': return { kind: 'normal', nnn: 'A' };
      case 'double': return { kind: 'normal', nnn: 'both' };
      default: return { kind: 'normal', nnn: 'none' };
    }
  },
  // 舊 {kind, nnn}（含舊存檔／舊分享連結） -> 存在屬性。
  // NNN 優先：限定必然兩邊都存在，有 NNN 標記就不是限定。
  legacyToAttr(mod) {
    const nnn = mod && mod.nnn;
    if (nnn === 'both') return 'double';
    if (nnn === 'A') return 'singleB';
    if (nnn === 'B') return 'singleA';
    if (mod && (mod.kind === 'exclusive' || mod.exclusive === true)) return 'exclusive';
    return 'native';
  },
};

window.RECOMB_ENGINE = {
  // 把「不可能達到的條數」機率併回可達上限（上限 = min(3, 池 - 對該基底的 NNN 數)）
  clampOdds(pool, nnnCount) {
    const rules = window.RECOMB_RULES.sideOdds;
    const safePool = Math.max(0, Math.min(6, pool));
    const raw = [...rules[safePool]];
    const max = Math.min(3, Math.max(0, safePool - nnnCount));
    if (max === 0) return [1, 0, 0, 0];
    if (max >= raw.length - 1) return raw; // 上限就是 3 條 → 不需併回
    for (let i = max + 1; i < raw.length; i++) raw[max] += raw[i];
    for (let i = max + 1; i < raw.length; i++) raw[i] = 0;
    return raw;
  },
  // 這條詞綴在指定基底上是否非原生
  isNnn(mod, base) {
    return mod.nnn === 'both' || mod.nnn === base;
  },
  // 使用者實際標的類型（不看存在條件）：提醒文案用
  markedExclusive(mod) {
    return mod.kind === 'exclusive' || mod.exclusive === true;
  },
  // 成品層面的限定：雙邊 NNN 的詞綴沒有類型可言，所以它不佔
  // 「成品最多存在 1 條限定」的名額，只佔該側池一格。
  // 新 UI 下「限定＋NNN」並存選不出來，只可能來自舊存檔／舊分享連結
  //（載入時會正規化成雙邊 NNN）；這裡不清掉 kind 是為了引擎層直接面對
  // 舊物件時仍能給出正確提醒。
  isExclusive(mod) {
    return mod.nnn !== 'both' && this.markedExclusive(mod);
  },
  // 只是「結果可能比顯示的更差」的提醒（不阻擋計算）：回傳字串陣列，由 UI 顯示
  warnings(a, b) {
    const mods = [...a.prefixes, ...a.suffixes, ...b.prefixes, ...b.suffixes].filter(m => m.enabled);
    return mods.filter(m => this.markedExclusive(m) && m.nnn === 'both').map(m => {
      const name = String(m.name || '').trim() || '（未命名詞綴）';
      return `「${name}」同時標了限定與「雙邊 NNN」：工具按「雙邊 NNN」處理，它不佔限定的 1 條名額、只佔該側池一格。`
        + '如果它其實是限定詞（例如精髓之、神廟詞），遊戲裡限定會互斥：同一側的多條限定只算 1 格池、補池效果會消失，甚至讓另一條限定被剔除，'
        + '實際結果可能比這裡顯示的更差；要照限定算，請把它的存在屬性改成「限定」。';
    });
  },
  getSide(itemA, itemB, side, base) {
    const mods = [...itemA[side], ...itemB[side]].filter(m => m.enabled);
    const nnnCount = mods.filter(m => this.isNnn(m, base)).length;
    return { mods, pool: mods.length, nnnCount, odds: this.clampOdds(mods.length, nnnCount) };
  },
  validate(a, b) {
    const mods = [...a.prefixes, ...a.suffixes, ...b.prefixes, ...b.suffixes].filter(m => m.enabled);
    const warnings = this.warnings(a, b);
    const exclusives = mods.filter(m => this.isExclusive(m)).length;
    const exCount = (item, side) => item[side].filter(m => m.enabled && this.isExclusive(m)).length;
    const onePerSide = item => item.prefixes.filter(m => m.enabled).length === 1 && item.suffixes.filter(m => m.enabled).length === 1;
    const aEx = exCount(a, 'prefixes') + exCount(a, 'suffixes');
    const bEx = exCount(b, 'prefixes') + exCount(b, 'suffixes');
    // 1p1e + 1e1s 特例：兩件各 1 前綴 1 後綴、各 1 條限定、且限定分居前綴與後綴側、全部原生
    const special = onePerSide(a) && onePerSide(b)
      && mods.every(m => m.nnn === 'none')
      && aEx === 1 && bEx === 1
      && exCount(a, 'prefixes') + exCount(b, 'prefixes') === 1
      && exCount(a, 'suffixes') + exCount(b, 'suffixes') === 1;
    if (exclusives > 1 && !special) {
      return { ok: false, message: '一般情況兩件素材合計最多一條限定；兩條只有在 1p1e + 1e1s 特例才允許。', warnings };
    }
    // 同名詞綴：同一側出現兩次以上時，工具視為同一條（結果最多存在一條），
    // 會讓底層組合被排除、機率被合併顯示，因此要提醒使用者確認。
    const seen = new Map();
    [['prefixes', '前綴'], ['suffixes', '後綴']].forEach(([key, text]) => {
      [a, b].forEach(item => item[key].filter(m => m.enabled).forEach(m => {
        const name = String(m.name || '').trim();
        if (!name) return;
        const id = `${key}|${name.toLowerCase()}`;
        const hit = seen.get(id);
        if (hit) hit.count += 1;
        else seen.set(id, { name, side: text, count: 1 });
      }));
    });
    const duplicates = [...seen.values()].filter(d => d.count > 1);
    return { ok: true, special, duplicates, warnings };
  },
  // 從池中挑出所有合法組合：排除對該基底非原生的詞綴、同名重複、超過一條限定
  // 空白名稱不算同名：每格是獨立的一條（UI 會顯示 ITEM A 前綴1 這類代號），只有具名且同名才排除
  combinations(aMods, bMods, count, base) {
    const isExclusive = mod => this.isExclusive(mod);
    const pool = [...aMods, ...bMods].filter(m => m.enabled && !this.isNnn(m, base));
    const out = [];
    function choose(start, picked) {
      if (picked.length === count) {
        const keys = picked.map(m => {
          const n = String(m.name || '').trim().toLowerCase();
          return n || `__blank@${pool.indexOf(m)}`;
        });
        if (new Set(keys).size !== picked.length) return;
        if (picked.filter(isExclusive).length > 1) return;
        out.push([...picked]);
        return;
      }
      for (let i = start; i < pool.length; i++) choose(i + 1, [...picked, pool[i]]);
    }
    if (count === 0) return [[]];
    choose(0, []);
    return out;
  },
  calculate(a, b) {
    const validation = this.validate(a, b);
    if (!validation.ok) return { validation };
    // 1p1e + 1e1s 特例：結果固定是 1 前 1 後，機率 ≥ 1/3（實測常見 >50%，精確值取決於詞綴權重）
    // 機制：先填的那一側抽中限定後，另一側池中的限定會被剔除；總條數已先擲定，部分結果因此被導向剩下的一般詞綴。
    if (validation.special) {
      return {
        validation,
        special: true,
        specialOutcome: { label: '1 前綴 1 後綴', lowerBound: 1 / 3, typical: '>50%' },
        bases: [], all: {}
      };
    }
    const bases = ['A', 'B'].map(base => {
      const prefix = this.getSide(a, b, 'prefixes', base);
      const suffix = this.getSide(a, b, 'suffixes', base);
      // 特例：整場只有 1 條前綴與 1 條後綴，且都原生 → 1前1後 / 只有前綴 / 只有後綴，各 1/3
      const oneAndOne = prefix.pool === 1 && suffix.pool === 1 && prefix.nnnCount === 0 && suffix.nnnCount === 0;
      const outcomes = [];
      if (oneAndOne) {
        const pCombos = this.combinations(a.prefixes, b.prefixes, 1, base);
        const sCombos = this.combinations(a.suffixes, b.suffixes, 1, base);
        const empty = [[]];
        outcomes.push({ label: '1 前綴 1 後綴', probability: 1 / 3, p: 1, s: 1, combos: pCombos.flatMap(pc => sCombos.map(sc => [...pc, ...sc])) });
        outcomes.push({ label: '1 前綴 0 後綴', probability: 1 / 3, p: 1, s: 0, combos: pCombos.flatMap(pc => empty.map(sc => [...pc, ...sc])) });
        outcomes.push({ label: '0 前綴 1 後綴', probability: 1 / 3, p: 0, s: 1, combos: empty.flatMap(pc => sCombos.map(sc => [...pc, ...sc])) });
        return { base, prefix, suffix, outcomes, rule: '1p1s', full: 0 };
      }
      prefix.odds.forEach((p, pi) => suffix.odds.forEach((s, si) => {
        if (!p || !s) return;
        const pCombos = this.combinations(a.prefixes, b.prefixes, pi, base);
        const sCombos = this.combinations(a.suffixes, b.suffixes, si, base);
        if (!pCombos.length || !sCombos.length) return;
        outcomes.push({ label: `${pi} 前綴 ${si} 後綴`, probability: p * s, p: pi, s: si, combos: pCombos.flatMap(pc => sCombos.map(sc => [...pc, ...sc])) });
      }));
      return { base, prefix, suffix, outcomes, rule: 'default', full: outcomes.find(o => o.p === 3 && o.s === 3)?.probability || 0 };
    });
    const all = {};
    bases.forEach(base => base.outcomes.forEach(o => { all[o.label] = (all[o.label] || 0) + o.probability / 2; }));
    return { validation, bases, all, special: validation.special };
  }
};
