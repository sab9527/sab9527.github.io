"""產生分享卡片 og-image.png（1200×630）；網站圖示改用外部 LOGO，不再本地產生。"""
import asyncio, base64, json, urllib.request, urllib.parse
import websockets

CARD = "file:///D:/WEB%20TEST/tools/og-card.html"


def http(method, path):
    req = urllib.request.Request("http://127.0.0.1:9222" + path, method=method)
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode())


class Page:
    def __init__(self, ws):
        self.ws, self.n = ws, 0

    async def send(self, method, **params):
        self.n += 1
        mid = self.n
        await self.ws.send(json.dumps({"id": mid, "method": method, "params": params}))
        while True:
            msg = json.loads(await asyncio.wait_for(self.ws.recv(), timeout=30))
            if msg.get("id") == mid:
                if "error" in msg:
                    raise RuntimeError(json.dumps(msg["error"]))
                return msg.get("result", {})

    async def ev(self, expr):
        r = await self.send("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        return r.get("result", {}).get("value")

    async def shot(self, path, width, height):
        await self.send("Emulation.setDeviceMetricsOverride", width=width, height=height, deviceScaleFactor=1, mobile=False)
        await asyncio.sleep(0.4)
        data = await self.send("Page.captureScreenshot", format="png")
        open(path, "wb").write(base64.b64decode(data["data"]))


async def main():
    tab = http("PUT", "/json/new?" + urllib.parse.quote(CARD, safe=""))
    async with websockets.connect(tab["webSocketDebuggerUrl"], max_size=40 * 1024 * 1024) as ws:
        p = Page(ws)
        await p.send("Runtime.enable")
        for _ in range(40):
            if await p.ev("document.readyState") == "complete":
                break
            await asyncio.sleep(0.25)
        await p.shot("D:/WEB TEST/og-image.png", 1200, 630)
        print("og-image.png 完成")
    try:
        urllib.request.urlopen(urllib.request.Request("http://127.0.0.1:9222/json/close/" + tab["id"], method="GET"), timeout=5).read()
    except Exception:
        pass


asyncio.run(main())
