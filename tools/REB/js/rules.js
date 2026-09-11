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
  // 非原生（NNN）標記：none = 原生；A = 選到 A 基底時消失；B = 選到 B 基底時消失；both = 兩個基底都消失
  nnnLabels: {
    none: '原生',
    A: '非原生（A）',
    B: '非原生（B）',
    both: '非原生（雙方）'
  },
  // 規劃器使用：詞綴類型顯示名稱
  kindLabels: {
    normal: '普通',
    exclusive: '限定詞',
    nnnA: '非原生（A）',
    nnnB: '非原生（B）',
    nnnBoth: '非原生（雙方）'
  },
  // 推薦路線資料，之後調整只需要改這裡
  routes: [
    { id: 'full', title: '3 前綴 3 後綴 × 3 前綴 3 後綴', description: '兩邊都準備滿，最直接追求完整六詞。', input: '3 前綴 3 後綴 + 3 前綴 3 後綴', full: 51.8, fivePlus: 92.2, tags: ['最穩 6 詞', '需要完整素材'] },
    { id: 'hybrid', title: '3 前綴 3 後綴 × 2 前綴 3 後綴／3 前綴 2 後綴', description: '保留高品質畸形件，仍有很高機率完成 5～6 詞。', input: '3 前綴 3 後綴 + 2 前綴 3 後綴／3 前綴 2 後綴', full: 41.0, fivePlus: 88.0, tags: ['高成功率', '適合中間件'] },
    { id: 'five', title: '2 前綴 2 後綴 × 1 前綴 3 後綴／3 前綴 1 後綴', description: '以 5 詞為主，降低直接變成六詞的期待。', input: '2 前綴 2 後綴 + 1 前綴 3 後綴／3 前綴 1 後綴', full: 5.7, fivePlus: 35.3, tags: ['偏向 5 詞', '素材門檻較低'] },
    { id: 'middle', title: '2 前綴 1 後綴 × 2 前綴 1 後綴', description: '培育 3 前綴 2 後綴、3 前綴 1 後綴與 2 前綴 2 後綴的中間素材。', input: '2 前綴 1 後綴 + 2 前綴 1 後綴', full: 0, fivePlus: 10.3, tags: ['中間步驟', '不要急著收尾'] },
    { id: 'middle-s', title: '1 前綴 2 後綴 × 1 前綴 2 後綴', description: '培育 2 前綴 3 後綴、1 前綴 3 後綴與 2 前綴 2 後綴的中間素材。', input: '1 前綴 2 後綴 + 1 前綴 2 後綴', full: 0, fivePlus: 10.3, tags: ['中間步驟', '不要急著收尾'] }
  ]
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
  getSide(itemA, itemB, side, base) {
    const mods = [...itemA[side], ...itemB[side]].filter(m => m.enabled);
    const nnnCount = mods.filter(m => this.isNnn(m, base)).length;
    return { mods, pool: mods.length, nnnCount, odds: this.clampOdds(mods.length, nnnCount) };
  },
  validate(a, b) {
    const mods = [...a.prefixes, ...a.suffixes, ...b.prefixes, ...b.suffixes].filter(m => m.enabled);
    const exclusives = mods.filter(m => m.exclusive).length;
    const exCount = (item, side) => item[side].filter(m => m.enabled && m.exclusive).length;
    const onePerSide = item => item.prefixes.filter(m => m.enabled).length === 1 && item.suffixes.filter(m => m.enabled).length === 1;
    const aEx = exCount(a, 'prefixes') + exCount(a, 'suffixes');
    const bEx = exCount(b, 'prefixes') + exCount(b, 'suffixes');
    // 1p1e + 1e1s 特例：兩件各 1 前綴 1 後綴、各 1 條限定詞、且限定詞分居前綴與後綴側、全部原生
    const special = onePerSide(a) && onePerSide(b)
      && mods.every(m => m.nnn === 'none')
      && aEx === 1 && bEx === 1
      && exCount(a, 'prefixes') + exCount(b, 'prefixes') === 1
      && exCount(a, 'suffixes') + exCount(b, 'suffixes') === 1;
    if (exclusives > 1 && !special) {
      return { ok: false, message: '一般情況兩件素材合計最多一條限定詞；兩條只有在 1p1e + 1e1s 特例才允許。' };
    }
    return { ok: true, special };
  },
  // 從池中挑出所有合法組合：排除對該基底非原生的詞綴、同名重複、超過一條限定詞
  combinations(aMods, bMods, count, base) {
    const pool = [...aMods, ...bMods].filter(m => m.enabled && !this.isNnn(m, base));
    const out = [];
    function choose(start, picked) {
      if (picked.length === count) {
        if (new Set(picked.map(m => m.name.toLowerCase())).size !== picked.length) return;
        if (picked.filter(m => m.exclusive).length > 1) return;
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
