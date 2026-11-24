"""Capture the raw HTTP response for an unknown-tool call and a wrong-type call (port 8104). Run: python raw_wire.py"""
import sys, json, uvicorn, threading, time, anyio
sys.path.insert(0, '.')
from mcp_server import mcp
from mcp import Client
CAP = []
app = mcp.streamable_http_app()
async def spy(scope, receive, send):
    if scope["type"] != "http":
        return await app(scope, receive, send)
    req, resp = [], []
    async def r():
        m = await receive(); req.append(m.get("body", b"")); return m
    async def s(m):
        if m["type"] == "http.response.start": resp.append(("status", m["status"]))
        if m["type"] == "http.response.body": resp.append(("body", m.get("body", b"")))
        await send(m)
    await app(scope, r, s)
    CAP.append((b"".join(req).decode(), resp))
t = threading.Thread(target=lambda: uvicorn.run(spy, host="127.0.0.1", port=8104, log_level="error"), daemon=True); t.start(); time.sleep(2)
async def main():
    async with Client("http://127.0.0.1:8104/mcp") as c:
        await c.call_tool("no_such_tool", {})
        await c.call_tool("delete_note", {"note_id": "abc"})
anyio.run(main)
for req, resp in CAP:
    try: m = json.loads(req)["method"] + ":" + json.loads(req).get("params", {}).get("name", "")
    except Exception: m = "?"
    if "no_such_tool" in m or "delete_note" in m:
        status = [v for k, v in resp if k == "status"][0]
        body = b"".join(v for k, v in resp if k == "body").decode()
        print(m, "HTTP", status, "\n", body[:500], "\n---")
