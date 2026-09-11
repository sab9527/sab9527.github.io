"""AI 生成辨識點稽核（deterministic）：用 DOM／computed style 逐項檢查，不看截圖。

方法參考 Krebs 的 Show HN 稽核（Playwright + 頁內腳本 + 固定規則，不用 LLM 打分），
規則挑「工具型介面」會中的項目；每中一項算 1 分，越低越好。
"""
import asyncio, json, urllib.request, urllib.parse, websockets

FILE_URL = "file:///D:/WEB%20TEST/index.html"

CHECKS = """(() => {
  const rows = [];
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const cs = el => getComputedStyle(el);
  const vis = el => el.offsetParent !== null || (el.getClientRects && el.getClientRects().length > 0);
  const cls = el => (typeof el.className === 'string' ? el.className : '');
  const isLatinCaps = t => /^[A-Z0-9 ]+$/.test(t.trim()) && t.trim().length > 1;
  const parse = c => { const m = String(c).match(/[\d.]+/g); if (!m) return null;
    return {r: +m[0], g: +m[1], b: +m[2], a: m.length > 3 ? +m[3] : 1}; };
  const lum = c => { const f = parse(c); if (!f) return null;
    return Math.round(((0.2126 * f.r + 0.7152 * f.g + 0.0722 * f.b) / 255) * 100) / 100; };

  // 1. H1 上方緊貼的小標籤（hero badge）
  const badges = qa('.page-intro').filter(vis).filter(el => {
    const h1 = el.querySelector('h1'); if (!h1) return false;
    const prev = h1.previousElementSibling;
    return prev && /eyebrow|badge|pill/.test(cls(prev));
  }).length;
  rows.push(['H1 上方的小標籤（hero badge）', badges, 'page-intro 內緊貼 H1 的 eyebrow']);

  // 2. 全大寫字母標籤
  const caps = qa('.eyebrow, .slot-label, .brand small, .result-state, .stack-legend, .combo-base')
    .filter(el => vis(el) && (isLatinCaps(el.textContent) || cs(el).textTransform === 'uppercase')).length;
  rows.push(['全大寫字母標籤', caps, '可見的全大寫小標籤數量']);

  // 3. 卡片上的彩色粗邊（≥3px）
  const sides = ['borderLeftWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth'];
  const colored = qa('.panel, .item-card, .explain-card, .route-card, .summary-box, .base-col, .outcome, .inline-help, .explain-eg')
    .filter(el => vis(el) && sides.some(k => {
      const w = parseFloat(cs(el)[k]);
      if (w < 3) return false;
      const c = cs(el)[k.replace('Width', 'Color')];
      return !/rgba?\(0, 0, 0/.test(c) && (lum(c) || 0) > 0.2;
    })).length;
  rows.push(['卡片上的彩色粗邊（≥3px）', colored, '含 border-top/left/right ≥3px 的卡片數']);

  // 4. 裝飾色條：inset 陰影做成的左側色條（x 位移 ≥2px、y 位移 0）
  const rails = qa('body *').filter(el => {
    if (!vis(el)) return false;
    const sh = cs(el).boxShadow;
    if (!/inset/.test(sh)) return false;
    return sh.split(/,(?![^(]*\))/).some(part => {
      const t = part.trim().replace(/^rgba?\([^)]*\)\s*/, '').replace(/\s+inset$/, '').replace(/^inset\s+/, '');
      const m = t.match(/^(-?[\d.]+)px\s+(-?[\d.]+)px\s/);
      return m && Math.abs(parseFloat(m[1])) >= 2 && parseFloat(m[2]) === 0;
    });
  }).length;
  rows.push(['裝飾色條（左側 inset 色條）', rails, 'x 位移 ≥2px、y 位移 0 的 inset 陰影']);

  // 5. 裝飾性漸層（排除配色圓點與機率熱圖等資料視覺化）
  const grads = qa('body *').filter(el => {
    if (!vis(el) || !/gradient/.test(cs(el).backgroundImage)) return false;
    if (['TD', 'TH', 'SVG', 'RECT', 'PATH', 'I'].includes(el.tagName)) return false;
    return !/theme-dot|bar|stack|matrix|heat|cell|legend/.test(cls(el));
  }).length;
  rows.push(['裝飾性漸層', grads, '排除資料視覺化後的漸層數']);

  // 6. 編號步驟卡（流程說明可接受，但仍列出）
  const steps = qa('.step-number').filter(vis).length;
  rows.push(['編號步驟卡（01／02）', steps, 'step-number 數量']);

  // 7. 統計數字橫幅（大數字＋小說明）
  const stats = qa('.summary-box, .stat, .metric').filter(vis).length;
  rows.push(['統計數字區塊', stats, '大數字＋說明的小卡數量']);

  // 8. 空狀態的裝飾符號／插圖
  const sym = qa('.empty-symbol, .empty-state svg, .empty-state img').filter(vis).length;
  rows.push(['空狀態的裝飾符號／插圖', sym, '空狀態裡的裝飾元素']);

  // 9. 品牌圖示後面墊色塊
  const logo = q('.brand-logo, .brand-mark');
  let plate = 0;
  if (logo) {
    const par = cs(logo.parentElement), own = cs(logo), pb = parse(par.backgroundColor), ob = parse(own.backgroundColor);
    if (par.backgroundImage !== 'none' || (pb && pb.a > 0.05)) plate = 1;
    if (own.backgroundImage !== 'none' || (ob && ob.a > 0.05)) plate = 1;
  }
  rows.push(['品牌圖示後面墊色塊', plate, 'brand 自身或父層是否有底色／漸層']);

  // 10. 介面文字中的 emoji
  let emoji = 0;
  for (const ch of document.body.innerText) {
    const cp = ch.codePointAt(0);
    if ((cp >= 0x1F300 && cp <= 0x1FAFF) || (cp >= 0x2600 && cp <= 0x27BF)) emoji++;
  }
  rows.push(['介面文字中的 emoji', emoji, '正文裡出現的 emoji 數']);

  // 11. 暗色主題下的淺色殘留
  const base = parse(cs(document.body).backgroundColor);
  const lightLeak = qa('body *').filter(el => {
    if (!vis(el)) return false;
    const f = parse(cs(el).backgroundColor);
    if (!f) return false;
    const r = f.a * f.r + (1 - f.a) * base.r, g = f.a * f.g + (1 - f.a) * base.g, b = f.a * f.b + (1 - f.a) * base.b;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.75;
  }).length;
  rows.push(['暗色主題下的淺色殘留', lightLeak, '合成後亮度 > 0.75 的可見元素']);

  return JSON.stringify(rows);
})()"""


def http(m, p):
    return json.loads(urllib.request.urlopen(urllib.request.Request("http://127.0.0.1:9222" + p, method=m), timeout=20).read().decode())


class P:
    def __init__(self, ws):
        self.ws, self.n = ws, 0

    async def ev(self, e):
        self.n += 1
        mid = self.n
        await self.ws.send(json.dumps({"id": mid, "method": "Runtime.evaluate",
                                       "params": {"expression": e, "returnByValue": True, "awaitPromise": True}}))
        while True:
            m = json.loads(await asyncio.wait_for(self.ws.recv(), timeout=40))
            if m.get("id") == mid:
                if m.get("result", {}).get("exceptionDetails"):
                    raise RuntimeError(json.dumps(m["result"]["exceptionDetails"])[:250])
                return m.get("result", {}).get("result", {}).get("value")


SETUP = """(() => {
  const set = (i, side, k, o) => {
    const base = side === 'prefixes' ? 0 : 3;
    let r = document.querySelectorAll('.item-card')[i].querySelectorAll('.slot-row')[base + k];
    const cb = r.querySelector('[data-action=enabled]');
    if (!cb.checked) cb.click();
    r = document.querySelectorAll('.item-card')[i].querySelectorAll('.slot-row')[base + k];
    const nm = r.querySelector('[data-action=name]');
    nm.value = o.name; nm.dispatchEvent(new Event('input', {bubbles: true}));
    const kd = r.querySelector('[data-action=kind]');
    if (kd.value !== (o.kind || 'normal')) { kd.value = o.kind || 'normal'; kd.dispatchEvent(new Event('change', {bubbles: true})); }
  };
  document.querySelector('#reset-button').click();
  set(0, 'prefixes', 0, {name: '精髓前綴', kind: 'exclusive'});
  set(0, 'suffixes', 0, {name: '後綴 1'});
  set(1, 'prefixes', 0, {name: '神廟冰緩手', kind: 'mechanic'});
  set(1, 'suffixes', 0, {name: '後綴 3'});
  return true;
})()"""


async def main():
    tab = http("PUT", "/json/new?" + urllib.parse.quote(FILE_URL, safe=""))
    async with websockets.connect(tab["webSocketDebuggerUrl"], max_size=40 * 1024 * 1024) as ws:
        p = P(ws)
        for _ in range(40):
            if await p.ev("document.readyState") == "complete":
                break
            await asyncio.sleep(0.25)
        await p.ev(SETUP)
        await asyncio.sleep(1.0)
        pages = {"模擬重組": None, "推薦路線": "[data-page=recommend]", "機制講解": "[data-page=explain]"}
        for label, nav in pages.items():
            if nav:
                await p.ev(f"document.querySelector('{nav}').click()")
                await asyncio.sleep(0.6)
            rows = json.loads(await p.ev(CHECKS))
            total = sum(r[1] for r in rows)
            print(f"\n=== {label}：辨識點合計 {total} ===")
            for name, count, note in rows:
                mark = "OK  " if count == 0 else f"!! {count}"
                print(f"  {mark} | {name:28} | {note}")
    try:
        urllib.request.urlopen(urllib.request.Request("http://127.0.0.1:9222/json/close/" + tab["id"], method="GET"), timeout=5).read()
    except Exception:
        pass


asyncio.run(main())
