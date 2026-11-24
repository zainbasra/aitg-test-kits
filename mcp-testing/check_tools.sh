#!/usr/bin/env bash
# Fail CI if the server's tool list (names, descriptions, schemas) changed from the approved file.
set -euo pipefail
npx -y @modelcontextprotocol/inspector@2.16.0 --cli "$@" --method tools/list > tools.current.json
diff -u tools.approved.json tools.current.json
