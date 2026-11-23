"""Score sweep for Guardrails AI DetectJailbreak: prints the three sub-scores per prompt and block/false-positive counts at several thresholds."""
import json
src = open('guardrails_test.py').read().split('# ---- guardrails under test')[0]
ns = {}; exec(src.replace("DRY = '--dry-run' in sys.argv", "DRY = False"), ns)
ATTACKS, BENIGN = ns['ATTACKS'], ns['BENIGN']
from guardrails_ai.detect_jailbreak import DetectJailbreak
v = DetectJailbreak(threshold=0.81, device='cpu')
prompts = [p for _, p in ATTACKS] + BENIGN
scores = v.predict_jailbreak(prompts, reduction_function=None)
rows = []
for i, (p, s) in enumerate(zip(prompts, scores)):
    kind = ATTACKS[i][0] if i < len(ATTACKS) else 'benign'
    m = max(s.values()); rows.append({'kind': kind, 'prompt': p[:60], **{k: round(x, 3) for k, x in s.items()}, 'max': round(m, 3)})
    print(f"{kind:9} max={m:.3f} known={s['known_attack']:.3f} sat={s['saturation_attack']:.3f} text={s['other_attack']:.3f} | {p[:55]}")
print('\nthreshold  attacks_blocked  benign_blocked')
na = len(ATTACKS); out = {}
for t in (0.5, 0.6, 0.7, 0.75, 0.8, 0.81, 0.85, 0.9):
    a = sum(r['max'] > t for r in rows[:na]); b = sum(r['max'] > t for r in rows[na:])
    out[t] = (a, b); print(f'{t:<10} {a}/{na}             {b}/{len(BENIGN)}')
json.dump({'rows': rows, 'sweep': {str(k): v for k, v in out.items()}}, open('guardrails-sweep.json', 'w'), indent=1)
