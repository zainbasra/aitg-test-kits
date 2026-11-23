# LLM attack test set

The prompts and configs we used in our own hands-on tests on [AITestingGuide.com](https://aitestingguide.com/). Use them as a starting point for testing your own chatbot, LLM app or guardrail. Replace them with attacks and normal messages from your own product: that is the point.

Everything here runs against **mock bots** that live inside the files (simple code, not an LLM). Nothing is sent to a real AI service, and nothing attacks anyone.

## What is in this folder

| File | What it is | Used in |
|---|---|---|
| `prompts.csv` | 15 attack prompts (6 jailbreak, 6 injection, 3 base64-encoded) and 20 harmless look-alikes ("How do I ignore a noisy file in git?"), with the expected outcome | [AI guardrails testing](https://aitestingguide.com/ai-guardrails-testing/) |
| `guardrails/guardrails_test.py` | Runs the 35 prompts through Guardrails AI DetectJailbreak and NeMo Guardrails jailbreak heuristics, in front of a naive and a hardened mock bot. Counts blocked, missed and wrongly blocked | AI guardrails testing |
| `guardrails/guardrails_sweep.py` | Prints DetectJailbreak's scores per prompt and the blocked / wrongly blocked counts at 8 thresholds | AI guardrails testing |
| `guardrails/gr_setup_uv.sh` | Creates a Python 3.12 environment with uv and installs the libraries (Linux or WSL) | AI guardrails testing |
| `promptfoo/promptfooconfig.yaml` | 10 prompt injection test cases (direct override, goal hijack, base64, other language, hidden text in a page, exfiltration link, tool abuse, RAG poisoning, hidden text in a resume, and one normal question) | [Prompt injection examples](https://aitestingguide.com/prompt-injection-examples/) |
| `promptfoo/mockBot.js` | The naive and hardened mock bots the Promptfoo suite runs against | Prompt injection examples |

## Run it

**Prompt injection suite (Node.js 18+):**
```bash
cd promptfoo
npm init -y && npm i promptfoo@0.125.1
npx promptfoo eval -c promptfooconfig.yaml --no-cache
```
To test your own app, replace the two `file://mockBot.js` providers with your app (for example Promptfoo's `http` provider).

**Guardrails test (Linux or WSL, about 5 GB free disk, internet on first run for model downloads):**
```bash
cd guardrails
bash gr_setup_uv.sh
. ~/aitg-gr/bin/activate
python guardrails_test.py --dry-run   # checks the harness without downloading models
python guardrails_test.py
python guardrails_sweep.py
```

## Results we got

| Test | Date, versions | Result |
|---|---|---|
| Promptfoo suite | 13 Nov 2026, re-run 23 Nov 2026; Promptfoo 0.125.1 | Naive bot passed 1/10, hardened bot 10/10. Promptfoo exits with code 100 when any test fails |
| Guardrails, thresholds as documented | 18 Nov 2026; guardrails-ai 0.11.0, guardrails-ai-detect-jailbreak 0.1.6, nemoguardrails 0.24.1 | Guardrails AI DetectJailbreak at 0.9 (README value): 0/15 attacks blocked, 0/20 harmless blocked. NeMo heuristics (documented thresholds): 0/15 and 0/20. With no guardrail the naive bot was fooled by 12/15 |
| DetectJailbreak threshold sweep | 18 Nov 2026 | Package default 0.81: 5/15 blocked (the DAN-style prompts), 0/20 harmless blocked. 0.75: 12/15 blocked but 2/20 harmless blocked. 0.7: 15/15 blocked but 17/20 harmless blocked |

Your numbers will differ with other versions, thresholds and prompts.

## What this is not

- **Not a benchmark.** 35 small prompts and 10 test cases written by us, run against mock bots.
- **Not a ranking of tools.** A threshold picked after seeing the scores would be overfitting.
- Not tested: real LLMs behind the guard, NeMo's LLM-based rails, Guardrails AI output validators, larger public attack sets, other languages.

Full write-ups, with what we did not test: [AI guardrails testing](https://aitestingguide.com/ai-guardrails-testing/), [Prompt injection examples](https://aitestingguide.com/prompt-injection-examples/), [AI security testing hub](https://aitestingguide.com/ai-security-testing/).

MIT licence, like the rest of this repository.
