/* 分享連結編解碼：把「模擬重組」的輸入壓成網址 hash 參數（純函式，不碰 DOM）。
 *
 * 格式：index.html#simulate?s=<base64url(JSON)>
 * JSON：{v:1, n:[名字表], m:[[item, side, slot, nameIdx, kind?, nnn?]...]}
 *   item: 0 = Item A，1 = Item B；side: 0 = 前綴，1 = 後綴；slot: 0-2
 *   kind: 0 原生（預設，省略）/ 2 限定（1 是已移除的「機制掉落」，解到時當原生）
 *   nnn: 0 原生（預設，省略）/ 1 只能存在 B / 2 只能存在 A / 3 兩邊都不存在
 * 省長度手段：只編啟用的格子、預設值省略、同名只存一次。
 */
window.RECOMB_SHARE = (() => {
  const VERSION = 1;
  // 2 保留給限定、1 不再產生：舊邊碼若帶著 1（已移除的機制掉落），一律當原生
  const KIND = { normal: 0, exclusive: 2 };
  const KIND_R = { 0: 'normal', 1: 'normal', 2: 'exclusive' };
  const NNN = { none: 0, A: 1, B: 2, both: 3 };
  const NNN_R = ['none', 'A', 'B', 'both'];
  const MAX_MODS = 12;   // 兩件 ×（3 前綴 + 3 後綴）
  const MAX_NAME = 60;
  const MAX_CODE = 4000;

  const utf8Encode = s => {
    if (typeof Buffer !== 'undefined') return Buffer.from(s, 'utf8').toString('base64');
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  };
  const utf8Decode = b64 => {
    if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64').toString('utf8');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  };
  const toUrlSafe = b64 => b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const fromUrlSafe = s => {
    let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return b64;
  };
  const blank = () => ({ name: '', enabled: false, kind: 'normal', nnn: 'none' });

  function encode(items) {
    const names = [];
    const nameIdx = new Map();
    const entries = [];
    (items || []).slice(0, 2).forEach((item, i) => {
      [['prefixes', 0], ['suffixes', 1]].forEach(([key, side]) => {
        const slots = (item && item[key]) || [];
        for (let g = 0; g < 3; g++) {
          const mod = slots[g];
          if (!mod || !mod.enabled) continue;
          const name = String(mod.name || '').trim();
          if (!name) continue;
          let n = nameIdx.get(name);
          if (n === undefined) { n = names.length; names.push(name); nameIdx.set(name, n); }
          const kind = KIND[mod.kind] || 0;
          const nnn = NNN[mod.nnn] || 0;
          const e = [i, side, g, n];
          if (kind !== 0 || nnn !== 0) {
            e.push(kind);
            if (nnn !== 0) e.push(nnn);
          }
          entries.push(e);
        }
      });
    });
    return toUrlSafe(utf8Encode(JSON.stringify({ v: VERSION, n: names, m: entries })));
  }

  function decode(code) {
    try {
      const s = extractCode(code);
      if (!s || s.length > MAX_CODE || !/^[A-Za-z0-9\-_]+$/.test(s)) return null;
      const data = JSON.parse(utf8Decode(fromUrlSafe(s)));
      if (!data || data.v !== VERSION || !Array.isArray(data.n) || !Array.isArray(data.m)) return null;
      if (data.n.length > MAX_MODS || data.m.length > MAX_MODS) return null;
      for (const n of data.n) {
        if (typeof n !== 'string' || !n.trim() || n.length > MAX_NAME) return null;
      }
      const items = [0, 1].map(() => ({
        prefixes: [blank(), blank(), blank()],
        suffixes: [blank(), blank(), blank()]
      }));
      const seen = new Set();
      for (const e of data.m) {
        if (!Array.isArray(e) || (e.length !== 4 && e.length !== 5 && e.length !== 6)) return null;
        const [i, side, g, n, k = 0, o = 0] = e;
        if (![i, side, g, n, k, o].every(Number.isInteger)) return null;
        if (i < 0 || i > 1 || side < 0 || side > 1 || g < 0 || g > 2) return null;
        if (n < 0 || n >= data.n.length || k < 0 || k > 2 || o < 0 || o > 3) return null;
        const pos = i + '|' + side + '|' + g;
        if (seen.has(pos)) return null;
        seen.add(pos);
        const kind = KIND_R[k];
        const nnn = NNN_R[o];
        items[i][side === 0 ? 'prefixes' : 'suffixes'][g] =
          { name: data.n[n], enabled: true, kind, nnn };
      }
      return { items };
    } catch (error) {
      return null;
    }
  }

  // 接受「整條網址」或「純邊碼」；回傳純邊碼，抽不出來回傳 null
  function extractCode(text) {
    if (typeof text !== 'string') return null;
    const s = text.trim();
    if (!s) return null;
    const m = s.match(/[?&#]s=([A-Za-z0-9\-_]+)/);
    if (m) return m[1];
    if (/^[A-Za-z0-9\-_]+$/.test(s)) return s;
    return null;
  }

  // 用目前網址（去掉舊 hash）組出分享網址；file:// 下 origin 是 'null'，所以直接切 href
  function pageUrl(page, code, href) {
    const base = String(href).split('#')[0];
    return base + '#' + page + '?s=' + code;
  }

  return { VERSION, encode, decode, extractCode, pageUrl };
})();
