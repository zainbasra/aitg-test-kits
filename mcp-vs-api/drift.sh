#!/bin/bash
cd "$(dirname "$0")"
start(){ RENAME=$1 python3 api_server.py & A=$!; RENAME=$1 python3 mcp_server.py & M=$!; for i in $(seq 1 50); do (exec 3<>/dev/tcp/127.0.0.1/8101 && exec 4<>/dev/tcp/127.0.0.1/8102) 2>/dev/null && break; sleep 0.1; done; }
stop(){ kill $A $M; wait $A $M 2>/dev/null; }
start 0; python3 drift.py baseline; stop
start 1; python3 drift.py drift > results/drift.json; RC=$?; stop
exit $RC
