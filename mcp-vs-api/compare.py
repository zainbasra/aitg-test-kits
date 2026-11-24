"""Run the same scenario against the REST API and the MCP server; print a JSON report.
Both servers must be running (api_server.py on 8101, mcp_server.py on 8102). Fresh servers per run."""
import json, time, statistics, sys
import anyio, httpx
from mcp import Client

API, MCP = "http://127.0.0.1:8101", "http://127.0.0.1:8102"
NOTES = [("Playwright locators", "getByRole survived the rename"),
         ("MCP testing", "snapshot the tool list"),
         ("Playwright traces", "open the trace viewer")]

def res_json(r):
    """MCP CallToolResult -> plain dict a tester can compare."""
    d = {"is_error": r.is_error, "text": " ".join(getattr(c, "text", "") for c in r.content)}
    if r.structured_content is not None:
        d["structured"] = r.structured_content
    return d

async def api_run(h):
    out = {}
    t = await h.get(API + "/openapi.json"); spec = t.json()
    out["discovery_bytes"] = len(t.content)
    out["discovery_ops"] = sorted(f"{m.upper()} {p}" for p, ms in spec["paths"].items() for m in ms)
    for title, body in NOTES:
        r = await h.post(API + "/notes", json={"title": title, "body": body})
    out["add_status"] = r.status_code
    r = await h.get(API + "/notes", params={"query": "playwright"})
    out["search"] = {"status": r.status_code, "count": len(r.json())}
    r = await h.delete(API + "/notes/1"); out["delete_ok"] = {"status": r.status_code, "body": r.json()}
    r = await h.delete(API + "/notes/99"); out["delete_missing"] = {"status": r.status_code, "body": r.json()}
    r = await h.post(API + "/notes", json={"title": " ", "body": "x"}); out["empty_title"] = {"status": r.status_code, "body": r.json()}
    r = await h.delete(API + "/notes/abc"); out["wrong_type"] = {"status": r.status_code, "msg": r.json()["detail"][0]["msg"]}
    r = await h.post(API + "/notes", json={"title": "no body"}); out["missing_arg"] = {"status": r.status_code, "msg": r.json()["detail"][0]["msg"]}
    return out

async def mcp_run():
    out = {}
    async with Client(MCP + "/mcp") as c:
        tl = await c.list_tools()
        out["discovery_bytes"] = len(json.dumps(tl.model_dump(mode="json", by_alias=True, exclude_none=True)).encode())
        out["discovery_ops"] = sorted(t.name for t in tl.tools)
        for title, body in NOTES:
            r = await c.call_tool("add_note", {"title": title, "body": body})
        out["add_is_error"] = r.is_error
        r = await c.call_tool("search_notes", {"query": "playwright"})
        out["search"] = res_json(r)
        out["delete_ok"] = res_json(await c.call_tool("delete_note", {"note_id": 1}))
        out["delete_missing"] = res_json(await c.call_tool("delete_note", {"note_id": 99}))
        out["empty_title"] = res_json(await c.call_tool("add_note", {"title": " ", "body": "x"}))
        out["wrong_type"] = res_json(await c.call_tool("delete_note", {"note_id": "abc"}))
        out["missing_arg"] = res_json(await c.call_tool("add_note", {"title": "no body"}))
        try:
            r = await c.call_tool("no_such_tool", {})
            out["unknown_tool"] = res_json(r)
        except Exception as e:
            out["unknown_tool"] = {"exception": type(e).__name__, "msg": str(e)[:160]}
    return out

async def timing(h, n=100):
    api, mcp = [], []
    for _ in range(10): await h.get(API + "/notes", params={"query": "mcp"})
    for _ in range(n):
        t = time.perf_counter(); await h.get(API + "/notes", params={"query": "mcp"}); api.append((time.perf_counter()-t)*1000)
    async with Client(MCP + "/mcp") as c:
        for _ in range(10): await c.call_tool("search_notes", {"query": "mcp"})
        for _ in range(n):
            t = time.perf_counter(); await c.call_tool("search_notes", {"query": "mcp"}); mcp.append((time.perf_counter()-t)*1000)
    # cold: one complete client session (connect + initialize + 1 call) vs one HTTP call on a new client
    t = time.perf_counter()
    async with httpx.AsyncClient() as h2: await h2.get(API + "/notes", params={"query": "mcp"})
    api_cold = (time.perf_counter()-t)*1000
    t = time.perf_counter()
    async with Client(MCP + "/mcp") as c: await c.call_tool("search_notes", {"query": "mcp"})
    mcp_cold = (time.perf_counter()-t)*1000
    q = lambda xs: {"median_ms": round(statistics.median(xs), 2), "p95_ms": round(sorted(xs)[int(len(xs)*0.95)-1], 2)}
    return {"api_warm": q(api), "mcp_warm": q(mcp), "api_cold_ms": round(api_cold, 1), "mcp_cold_ms": round(mcp_cold, 1)}

async def raw_checks(h):
    """What a tester hitting the MCP endpoint with a plain HTTP tool (curl/Postman) sees."""
    call = {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "search_notes", "arguments": {"query": "x"}}}
    r1 = await h.post(MCP + "/mcp", json=call, headers={"Accept": "application/json, text/event-stream"})
    r2 = await h.post(MCP + "/mcp", json=call)  # no Accept header
    return {"no_initialize": {"status": r1.status_code, "body": r1.text[:200]},
            "no_accept_header": {"status": r2.status_code, "body": r2.text[:200]}}

async def main():
    async with httpx.AsyncClient() as h:
        for base in (API, MCP): await h.post(base + "/_reset")
        api = await api_run(h); mcp = await mcp_run()
        api_log = (await h.get(API + "/_stats")).json(); mcp_log = (await h.get(MCP + "/_stats")).json()
        for base in (API, MCP): await h.post(base + "/_reset")
        tm = await timing(h)
        raw = await raw_checks(h)
    summ = lambda log: {"http_requests": len(log), "bytes_in": sum(x["in"] for x in log), "bytes_out": sum(x["out"] for x in log),
                        "statuses": sorted({x["status"] for x in log})}
    mcp_errors_http = [ {"rpc": x["rpc"], "status": x["status"]} for x in mcp_log if x["rpc"] and x["rpc"].startswith("tools/call:delete_note")]
    print(json.dumps({"api": api, "mcp": mcp, "traffic": {"api": summ(api_log), "mcp": summ(mcp_log),
          "mcp_requests": [ (x["method"], x["rpc"], x["status"]) for x in mcp_log]},
          "mcp_delete_http_status": mcp_errors_http, "timing": tm, "raw": raw}, indent=1))

anyio.run(main)
