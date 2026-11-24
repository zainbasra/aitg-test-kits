#!/bin/bash
# Fresh servers, one compare run, servers stopped. Usage: ./run.sh N
cd "$(dirname "$0")"
python3 api_server.py & A=$!
python3 mcp_server.py & M=$!
for i in $(seq 1 50); do (exec 3<>/dev/tcp/127.0.0.1/8101 && exec 4<>/dev/tcp/127.0.0.1/8102) 2>/dev/null && break; sleep 0.1; done
python3 compare.py > results/run$1.json; RC=$?
kill $A $M; wait $A $M 2>/dev/null
exit $RC
