"""ASGI middleware: counts HTTP requests, bytes in/out, status codes and the JSON-RPC method of each request.
GET /_stats returns the log, POST /_reset clears it. Used for both servers so the numbers are comparable."""
import json
class Counter:
    def __init__(self, app):
        self.app, self.log = app, []
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        if scope["path"] == "/_stats":
            body = json.dumps(self.log).encode()
            await send({"type": "http.response.start", "status": 200, "headers": [(b"content-type", b"application/json")]})
            return await send({"type": "http.response.body", "body": body})
        if scope["path"] == "/_reset":
            self.log.clear()
            await send({"type": "http.response.start", "status": 204, "headers": []})
            return await send({"type": "http.response.body", "body": b""})
        rec = {"method": scope["method"], "path": scope["path"], "in": 0, "out": 0, "status": None, "rpc": None}
        chunks = []
        async def recv():
            m = await receive()
            if m["type"] == "http.request":
                rec["in"] += len(m.get("body", b"")); chunks.append(m.get("body", b""))
            return m
        async def snd(m):
            if m["type"] == "http.response.start":
                rec["status"] = m["status"]
            elif m["type"] == "http.response.body":
                rec["out"] += len(m.get("body", b""))
            await send(m)
        try:
            await self.app(scope, recv, snd)
        finally:
            try:
                j = json.loads(b"".join(chunks) or b"null")
                if isinstance(j, dict) and "method" in j:
                    rec["rpc"] = j["method"] + (":" + j["params"]["name"] if j["method"] == "tools/call" else "")
            except Exception:
                pass
            self.log.append(rec)
