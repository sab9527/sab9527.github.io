"""UI 稽核：找出暗色主題下仍是淺色底的殘留區塊（半透明色會與底色合成後再判定）。"""
import asyncio, json, urllib.request, urllib.parse, websockets

FILE_URL = "file:///D:/WEB%20TEST/index.html"
SEL = [".site-header", ".panel", ".item-card", ".slot-row input[type=text]", ".slot-row select",
       ".outcome", ".route-meta span", ".mini-diagram", ".formula", ".tag.normal", ".tag.exclusive", ".tag.nnn",
       ".validation.error", ".validation.ok", ".route-card.best", ".summary-box", ".inline-help",
       ".input-panel", ".result-panel", ".explain-card", ".prob-table td", ".stack-bar", ".step-table td",
       ".dist-matrix td", ".explain-eg", ".nnn-table td", ".base-col.col-a", ".base-col.col-b", "body",
       ".empty-state", ".theme-switch"]

PROBE = """(() => {
  const parse = c => { const m = String(c).match(/[\\d.]+/g); if (!m) return null;
    return {r: +m[0], g: +m[1], b: +m[2], a: m.length > 3 ? +m[3] : 1}; };
  const bodyBg = parse(getComputedStyle(document.body).backgroundColor) || {r: 0, g: 0, b: 0, a: 1};
  const lum = c => { const f = parse(c); if (!f) return null; if (f.a === 0) return 0;
    const r = f.a * f.r + (1 - f.a) * bodyBg.r, g = f.a * f.g + (1 - f.a) * bodyBg.g, b = f.a * f.b + (1 - f.a) * bodyBg.b;
    return Math.round(((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) * 100) / 100; };
  const out = {};
  for (const s of %s) {
    const el = document.querySelector(s);
    if (!el) { out[s] = 'missing'; continue; }
    const bg = getComputedStyle(el).backgroundColor;
    out[s] = {raw: bg, lum: lum(bg)};
  }
  return JSON.stringify(out);
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
            m = json.loads(await asyncio.wait_for(self.ws.recv(), timeout=30))
            if m.get("id") == mid:
                if m.get("result", {}).get("exceptionDetails"):
                    raise RuntimeError(json.dumps(m["result"]["exceptionDetails"])[:250])
                return m.get("result", {}).get("result", {}).get("value")


async def main():
    tab = http("PUT", "/json/new?" + urllib.parse.quote(FILE_URL, safe=""))
    async with websockets.connect(tab["webSocketDebuggerUrl"], max_size=40 * 1024 * 1024) as ws:
        p = P(ws)
        for _ in range(40):
            if await p.ev("document.readyState") == "complete":
                break
            await asyncio.sleep(0.25)
        await p.ev("""(() => {
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
          set(0, 'prefixes', 1, {name: '前綴 2'});
          set(0, 'suffixes', 0, {name: '後綴 1'});
          set(1, 'prefixes', 0, {name: '神廟冰緩手', kind: 'mechanic'});
          set(1, 'suffixes', 0, {name: '後綴 3'});
          return true;
        })()""")
        await asyncio.sleep(1.2)
        report, flagged, missing = {}, {}, set()
        for theme in ["emerald", "graphite", "ember"]:
            await p.ev(f"document.querySelector('.theme-dot[data-theme={theme}]').click()")
            await asyncio.sleep(0.4)
            res = json.loads(await p.ev(PROBE % json.dumps(SEL)))
            report[theme] = res
            flagged[theme] = {s: v for s, v in res.items() if isinstance(v, dict) and v["lum"] is not None and v["lum"] > 0.5}
            missing |= {s for s, v in res.items() if v == "missing"}
        print(json.dumps(flagged, indent=1, ensure_ascii=False))
        print("missing:", sorted(missing))
        print("檢查元素數:", len(SEL))
    try:
        urllib.request.urlopen(urllib.request.Request("http://127.0.0.1:9222/json/close/" + tab["id"], method="GET"), timeout=5).read()
    except Exception:
        pass


asyncio.run(main())
