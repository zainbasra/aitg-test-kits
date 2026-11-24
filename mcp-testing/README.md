# MCP testing kit (AITG Notes server)

Test code for the article https://aitestingguide.com/mcp-testing/ (24 Nov 2026).
Run locally only (stdio and 127.0.0.1). No LLM, no API keys.

Tested with: mcp (Python SDK) 2.3.0, MCP Inspector 2.16.0, pytest 9.2.0, anyio 4.16.0, Python 3.13, Node 22.

## Files
- `server.py`: the mock MCP server (4 tools, 1 resource template, 1 prompt). `AITG_BUG=1` turns on two bugs (case-sensitive search, `read_file` stops checking paths).
- `server_drift.py`: copy with `delete_note` argument renamed and a hidden instruction added to its description (tool drift / poisoning).
- `server_v0_valueerror.py`: copy that raises `ValueError` instead of `ToolError` for expected errors (SDK 1.x habit).
- `tests/`: 16 in-memory tests plus 2 transport tests (stdio, Streamable HTTP on 127.0.0.1:8000).
- `check_tools.sh` + `tools.approved.json`: Inspector CLI snapshot check of `tools/list`.

## Run
```
python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
python -m pytest -q tests                              # 18 passed
AITG_BUG=1 python -m pytest -q tests                   # bug variant: tests fail
AITG_SERVER=server_drift python -m pytest -q tests     # drift variant: tests fail
AITG_SERVER=server_v0_valueerror python -m pytest -q tests
./check_tools.sh python server.py                      # exit 0
./check_tools.sh python server_drift.py                # exit 1, shows the diff
```

`secret.env` is a dummy file (`SECRET=do-not-leak`), not a real secret. The traversal tests check that its contents never come back; with `AITG_BUG=1` they fail because `read_file` stops checking paths.

Not tested: Inspector browser UI and TUI, SSE, OAuth, sampling/elicitation, TypeScript servers, real AI clients, load.
