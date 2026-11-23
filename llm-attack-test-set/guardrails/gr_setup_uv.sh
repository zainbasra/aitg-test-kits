#!/bin/bash
# No sudo needed: uses uv (installs it if missing) to create a Python 3.12 venv.
date -Is > setup-time.txt
export PATH="$HOME/.local/bin:$PATH"
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh || { echo "uv install failed"; exit 3; }
  export PATH="$HOME/.local/bin:$PATH"
fi
uv --version
rm -rf ~/aitg-gr
uv venv --python 3.12 ~/aitg-gr || exit 4
. ~/aitg-gr/bin/activate
uv pip install torch --index-url https://download.pytorch.org/whl/cpu || exit 5
uv pip install transformers guardrails-ai guardrails-ai-detect-jailbreak nemoguardrails || exit 6
uv pip list 2>/dev/null | grep -i -E "^(torch|transformers|guardrails|nemoguardrails)"
python -c "import guardrails, nemoguardrails; from guardrails_ai.detect_jailbreak import DetectJailbreak; print('imports ok')"
echo "exit $?" >> setup-time.txt; date -Is >> setup-time.txt
