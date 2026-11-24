# MCP vs API: the same service, two interfaces, one test

One small notes service (`notes_core.py`) exposed twice on your machine:
- `api_server.py`: a REST API (FastAPI) on 127.0.0.1:8101
- `mcp_server.py`: an MCP server (official Python SDK 2.3.0, Streamable HTTP) on 127.0.0.1:8102/mcp

`counting.py` wraps both servers and records every HTTP request (method, status, body bytes in/out, JSON-RPC method), so the numbers are comparable.

## Run
```
pip install -r requirements.txt
./run.sh 1        # fresh servers, runs compare.py, writes results/run1.json
./drift.sh        # renames delete's argument note_id -> id on both, replays an old client, writes results/drift.json
python raw_wire.py # prints the raw HTTP response for an unknown tool and a wrong-type call
```
Local only: nothing leaves 127.0.0.1, no API keys, no LLM.

## What it checks
1. Discovery: OpenAPI document vs `tools/list`.
2. The same scenario on both: add 3 notes, search, delete, delete a missing note, empty title, wrong type, missing argument, unknown tool.
3. HTTP status codes and traffic for the whole scenario.
4. Speed: 100 warm calls each (median, p95) and one cold call with a new client.
5. A raw `tools/call` POST without the MCP session handshake.
6. Contract drift: rename one argument and replay an old client.
7. The raw wire response for errors (HTTP status and JSON-RPC body).

## Our results (24 Nov 2026, Python 3.13, mcp 2.3.0, FastAPI 0.121.0, 5 runs)
- Every MCP tool error (missing note, validation errors, unknown tool) came back as HTTP 200 with isError true; the API returned 404/422.
- Renaming note_id to id broke old MCP calls but not old REST calls (the path parameter name is not sent).
- Scenario traffic: API 10 requests / 228 request bytes; MCP 12 requests / 3,511 request bytes (protocol 2026-07-28 sends a _meta block with every request).
- Local loopback timings only, not a benchmark. Write-up: https://aitestingguide.com/mcp-vs-api/ (when published).
