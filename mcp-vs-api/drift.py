"""Contract drift: same old client calls against servers where delete's argument was renamed note_id -> id.
Also compares the discovery documents (OpenAPI vs tools/list) with the saved baseline."""
import json, anyio, httpx
from mcp import Client
API, MCP = "http://127.0.0.1:8101", "http://127.0.0.1:8102"

async def snap():
    async with httpx.AsyncClient() as h:
        spec = (await h.get(API + "/openapi.json")).json()
    async with Client(MCP + "/mcp") as c:
        tools = (await c.list_tools()).model_dump(mode="json", by_alias=True, exclude_none=True)
    return spec, tools

async def old_client():
    out = {}
    async with httpx.AsyncClient() as h:
        await h.post(API + "/notes", json={"title": "a", "body": "b"})
        r = await h.delete(API + "/notes/1")   # an old client builds the same URL
        out["api_old_call"] = {"status": r.status_code, "body": r.json()}
    async with Client(MCP + "/mcp") as c:
        await c.call_tool("add_note", {"title": "a", "body": "b"})
        r = await c.call_tool("delete_note", {"note_id": 1})   # an old agent sends the old argument name
        out["mcp_old_call"] = {"is_error": r.is_error, "text": " ".join(getattr(x, "text", "") for x in r.content)[:220]}
    return out

async def main():
    import sys
    mode = sys.argv[1]
    spec, tools = await snap()
    if mode == "baseline":
        json.dump({"spec": spec, "tools": tools}, open("results/baseline.json", "w"))
        print("baseline saved")
    else:
        base = json.load(open("results/baseline.json"))
        out = await old_client()
        out["openapi_changed"] = base["spec"] != spec
        out["tools_list_changed"] = base["tools"] != tools
        out["openapi_paths_before_after"] = [sorted(base["spec"]["paths"]), sorted(spec["paths"])]
        d0 = [t for t in base["tools"]["tools"] if t["name"] == "delete_note"][0]["inputSchema"]["required"]
        d1 = [t for t in tools["tools"] if t["name"] == "delete_note"][0]["inputSchema"]["required"]
        out["mcp_required_before_after"] = [d0, d1]
        print(json.dumps(out, indent=1))
anyio.run(main)
