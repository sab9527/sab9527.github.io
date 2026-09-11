/* 路線規劃器：給定「想要的成品」，反推素材準備路線與每步成功率。
   與 UI 分離，方便後續調整門檻或權重。 */
window.RECOMB_PLANNER = (() => {
  const E = window.RECOMB_ENGINE;
  const MIN_STEP_ODDS = 0.05;   // 單步成功率低於此值就不推薦
  const MAX_ROUTES = 3;
  const MAX_SINGLE = 3;

  const KIND = {
    normal: { exclusive: false, nnn: 'none', text: '普通' },
    exclusive: { exclusive: true, nnn: 'none', text: '限定詞' },
    nnnA: { exclusive: false, nnn: 'A', text: '非原生（A）' },
    nnnB: { exclusive: false, nnn: 'B', text: '非原生（B）' },
    nnnBoth: { exclusive: false, nnn: 'both', text: '非原生（雙方）' }
  };

  const size = st => st.prefixes.length + st.suffixes.length;
  const modsOf = st => [...st.prefixes, ...st.suffixes];
  const stKey = st => [...st.prefixes.map(m => 'P:' + m.name).sort(), ...st.suffixes.map(m => 'S:' + m.name).sort()].join('|');
  const stInfo = st => ({
    prefixes: st.prefixes.map(m => ({ name: m.name, kind: m.kind })),
    suffixes: st.suffixes.map(m => ({ name: m.name, kind: m.kind })),
    text: [...st.prefixes.map(m => m.name), ...st.suffixes.map(m => m.name)].join(' + ') || '空',
    counts: `${st.prefixes.length} 前綴 ${st.suffixes.length} 後綴`
  });

  function blockedFor(mod, baseMode) {
    const n = KIND[mod.kind].nnn;
    if (baseMode === 'same') return n !== 'none';
    return n === baseMode || n === 'both';
  }

  function feasibility(target) {
    const all = modsOf(target);
    const issues = [], hints = [];
    if (!all.length) issues.push('請至少勾選一條想要的詞綴。');
    const ex = all.filter(m => m.kind === 'exclusive');
    if (ex.length > 1) issues.push(`限定詞最多只能保留一條，目前有 ${ex.length} 條（${ex.map(m => m.name).join('、')}）。`);
    if (target.baseMode === 'same') {
      const bad = all.filter(m => blockedFor(m, 'same'));
      if (bad.length) issues.push(`兩件素材同基底時，非原生詞綴無法保留：${bad.map(m => m.name).join('、')}。請改用不同基底，或把類型改成「普通」。`);
    } else {
      const bad = all.filter(m => blockedFor(m, target.baseMode));
      if (bad.length) issues.push(`目標基底是 Item ${target.baseMode} 的基底時，這些非原生詞綴無法保留：${bad.map(m => m.name).join('、')}。`);
    }
    const counts = new Map();
    all.forEach(m => counts.set(m.name.toLowerCase(), (counts.get(m.name.toLowerCase()) || 0) + 1));
    const dups = [...counts.entries()].filter(([, c]) => c > 1).map(([n]) => n);
    if (dups.length) issues.push(`成品上同名詞綴只會有一條，請把重複的名稱改掉：${dups.join('、')}。`);
    if (target.baseMode !== 'same' && all.length) hints.push('兩件素材要用不同基底（Item A 用 A 基底、Item B 用 B 基底），否則結果不會是你要的基底，成功率再乘 50%。');
    if (ex.length === 1) hints.push('限定詞只能放其中一件素材，兩件都放會直接無效。');
    if (all.length >= 3) hints.push('素材上只放你要的詞綴，不要帶其他雜詞，否則結果留下的可能不是你要的那幾條。');
    return { ok: issues.length === 0, issues, hints };
  }

  // 單步成功率：結果要在該側留下「全部」目標詞綴
  function stepProbability(st, A, B, baseMode) {
    const side = (name) => {
      const pool = [...A[name], ...B[name]];
      return { pool: pool.length, distinct: st[name].length, nnn: pool.filter(m => blockedFor(m, baseMode)).length };
    };
    const P = side('prefixes'), S = side('suffixes');
    if (P.pool === 1 && S.pool === 1 && P.nnn === 0 && S.nnn === 0 && P.distinct === 1 && S.distinct === 1) {
      return baseMode === 'same' ? 1 / 3 : 1 / 6;   // 1 前綴 + 1 後綴 特例
    }
    const p = E.clampOdds(P.pool, P.nnn)[P.distinct] || 0;
    const s = E.clampOdds(S.pool, S.nnn)[S.distinct] || 0;
    return p * s * (baseMode === 'same' ? 1 : 0.5);
  }

  function assignAll(n) {
    const out = [], total = Math.pow(3, n);
    for (let i = 0; i < total; i++) {
      let x = i; const arr = [];
      for (let k = 0; k < n; k++) { arr.push(x % 3); x = Math.floor(x / 3); }
      out.push(arr);
    }
    return out;
  }

  // 每個詞綴可放 A、放 B、或兩邊都放（重複擺放撐高池數）
  function enumerateSplits(st) {
    const splits = [], seen = new Set();
    for (const ap of assignAll(st.prefixes.length)) {
      for (const as of assignAll(st.suffixes.length)) {
        const A = { prefixes: [], suffixes: [] }, B = { prefixes: [], suffixes: [] };
        st.prefixes.forEach((m, i) => { if (ap[i] !== 1) A.prefixes.push(m); if (ap[i] !== 0) B.prefixes.push(m); });
        st.suffixes.forEach((m, i) => { if (as[i] !== 1) A.suffixes.push(m); if (as[i] !== 0) B.suffixes.push(m); });
        if (!size(A) || !size(B)) continue;
        const kA = stKey(A), kB = stKey(B);
        if (kA === stKey(st) || kB === stKey(st)) continue;   // 不能拿目標本身當素材
        const ex = [...A.prefixes, ...A.suffixes, ...B.prefixes, ...B.suffixes].filter(m => m.kind === 'exclusive').length;
        if (ex > 1) continue;
        const sig = [kA, kB].sort().join('#');
        if (seen.has(sig)) continue;
        seen.add(sig);
        splits.push({ A, B });
      }
    }
    return splits;
  }

  function shapeOf(split) {
    const count = st => `${st.prefixes.length}x${st.suffixes.length}`;
    const dup = st => st.prefixes.length + st.suffixes.length;
    return [count(split.A) + '|' + count(split.B), dup(split.A) + dup(split.B)].join('@');
  }

  function planState(st, baseMode, memo) {
    const key = stKey(st);
    if (Object.prototype.hasOwnProperty.call(memo, key)) return memo[key];
    if (size(st) <= 1) {
      const r = { leaves: 1, attempts: 0, probability: 1, steps: [], isLeaf: true };
      memo[key] = r;
      return r;
    }
    let best = null;
    for (const { A, B } of enumerateSplits(st)) {
      const p = stepProbability(st, A, B, baseMode);
      if (p < MIN_STEP_ODDS) continue;
      const ra = planState(A, baseMode, memo), rb = planState(B, baseMode, memo);
      if (!ra || !rb) continue;
      const route = {
        leaves: (ra.leaves + rb.leaves) / p,
        attempts: (ra.attempts + rb.attempts + 1) / p,
        probability: p,
        steps: [...ra.steps, ...rb.steps, { a: A, b: B, result: st, probability: p, isFinal: false }],
        isLeaf: false
      };
      if (!best || route.leaves < best.leaves - 1e-9) best = route;
    }
    memo[key] = best;
    return best;
  }

  function leafList(steps) {
    const map = new Map();
    steps.forEach(s => [s.a, s.b].forEach(item => {
      if (size(item) !== 1) return;
      const m = modsOf(item)[0];
      const rec = map.get(m.name) || { name: m.name, side: item.prefixes.length ? '前綴' : '後綴', kind: m.kind, count: 0 };
      rec.count += 1;
      map.set(m.name, rec);
    }));
    return [...map.values()];
  }

  const stepView = s => ({
    a: stInfo(s.a), b: stInfo(s.b), result: stInfo(s.result), probability: s.probability
  });

  function routesFor(target, limit) {
    const memo = {};
    const routes = [], seen = new Set();
    for (const { A, B } of enumerateSplits(target)) {
      const p = stepProbability(target, A, B, target.baseMode);
      if (p < MIN_STEP_ODDS) continue;
      const ra = planState(A, target.baseMode, memo), rb = planState(B, target.baseMode, memo);
      if (!ra || !rb) continue;
      const rawSteps = [...ra.steps, ...rb.steps, { a: A, b: B, result: target, probability: p }];
      const key = shapeOf({ A, B }) + '|' + rawSteps.length;
      if (seen.has(key)) continue;
      seen.add(key);
      const probability = rawSteps.reduce((acc, s) => acc * s.probability, 1);
      routes.push({
        leaves: (ra.leaves + rb.leaves) / p,
        attempts: (ra.attempts + rb.attempts + 1) / p,
        probability,
        stepCount: rawSteps.length,
        steps: rawSteps.map(stepView),
        leaves_: leafList(rawSteps),
        finalStep: stepView(rawSteps[rawSteps.length - 1]),
        firstStep: stepView(rawSteps[0])
      });
    }
    routes.sort((x, y) => x.leaves - y.leaves || y.probability - x.probability);
    return routes.slice(0, limit || MAX_ROUTES);
  }

  function singleStepOptions(target, limit) {
    const memo = {};
    const options = [], seen = new Set();
    for (const { A, B } of enumerateSplits(target)) {
      const p = stepProbability(target, A, B, target.baseMode);
      if (p < MIN_STEP_ODDS) continue;
      const key = shapeOf({ A, B });
      if (seen.has(key)) continue;
      seen.add(key);
      const ra = planState(A, target.baseMode, memo), rb = planState(B, target.baseMode, memo);
      const aCost = ra ? ra.leaves : Infinity, bCost = rb ? rb.leaves : Infinity;
      options.push({
        a: stInfo(A), b: stInfo(B), probability: p,
        prepare: aCost + bCost,
        total: (aCost + bCost) / p,
        attempts: ((ra ? ra.attempts : 0) + (rb ? rb.attempts : 0) + 1) / p,
        aCost, bCost
      });
    }
    options.sort((x, y) => y.probability - x.probability);
    return options.slice(0, limit || MAX_SINGLE);
  }

  function plan(target) {
    const check = feasibility(target);
    const result = { target, feasibility: check, singleStep: [], routes: [], leaves: [], singleAffix: false, threshold: MIN_STEP_ODDS };
    if (!check.ok) return result;
    if (size(target) <= 1) {
      result.singleAffix = true;
      const m = modsOf(target)[0];
      result.leaves = [{ name: m.name, side: target.prefixes.length ? '前綴' : '後綴', kind: m.kind, count: 1 }];
      return result;
    }
    result.singleStep = singleStepOptions(target, MAX_SINGLE);
    result.routes = routesFor(target, MAX_ROUTES);
    if (result.routes.length) result.leaves = result.routes[0].leaves_;
    return result;
  }

  return { plan, feasibility, stepProbability, enumerateSplits, stInfo, stKey, size, blockedFor, KIND, MIN_STEP_ODDS, shapeOf };
})();
