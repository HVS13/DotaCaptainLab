"""Independent certificate verification using exact rational arithmetic; no optimizer dependency."""
import json
from fractions import Fraction as F
from pathlib import Path
root=Path(__file__).resolve().parent.parent/'docs/research'
matrix=json.loads((root/'strategy-game-matrix.json').read_text())
result=json.loads((root/'strategy-game-analysis.json').read_text())
payoff=matrix['payoff']; solution=result['solution']
assert len(payoff)==64 and all(len(row)==64 and all(v in (0,1) for v in row) for row in payoff)
def distribution(values):
    weights=[F(str(v)) for v in values]
    assert len(weights)==64 and all(v>=0 for v in weights)
    mass=sum(weights); assert abs(mass-1)<F(1,10**8)
    return [v/mass for v in weights]
p=distribution(solution['row']); q=distribution(solution['column'])
lower=min(sum(p[i]*payoff[i][j] for i in range(64)) for j in range(64))
upper=max(sum(payoff[i][j]*q[j] for j in range(64)) for i in range(64))
assert 0<=lower<=upper<=1
assert upper-lower<=F(1,10**7)
assert abs(float(lower)-solution['lower'])<1e-8 and abs(float(upper)-solution['upper'])<1e-8
baseline=payoff[result['baseline']['index']]
assert sum(baseline)==result['baseline']['wins'] and min(baseline)==result['baseline']['worstResponse']
dominators=[i for i,row in enumerate(payoff) if all(v>=baseline[j] for j,v in enumerate(row))]
assert dominators==result['descriptive']['baselineDominatingRows']
pure_value=max(min(row) for row in payoff)
assert lower+F(1,10**7)>=pure_value
rounded_p=[v.limit_denominator(10**6) for v in p]; rounded_q=[v.limit_denominator(10**6) for v in q]
assert sum(rounded_p)==1 and sum(rounded_q)==1
rounded_lower=min(sum(rounded_p[i]*payoff[i][j] for i in range(64)) for j in range(64))
rounded_upper=max(sum(payoff[i][j]*rounded_q[j] for j in range(64)) for i in range(64))
assert rounded_lower==rounded_upper, 'Reconstructed rational distributions need an exact equality certificate'
report={'independentCertificate':'passed','exactLower':str(lower),'exactUpper':str(upper),'exactGap':str(upper-lower),'rationalGameValue':str(rounded_lower),'rationalRow':[str(v) for v in rounded_p],'rationalColumn':[str(v) for v in rounded_q],'pureMaximin':pure_value,'baselineWins':sum(baseline),'baselineWorstResponse':min(baseline)}
(root/'strategy-game-certificate.json').write_text(json.dumps(report,indent=2))
oracle_path=root/'strategy-game-oracle.json'
if oracle_path.exists():
    oracle=json.loads(oracle_path.read_text()); op=distribution(oracle['row']); oq=distribution(oracle['column'])
    ol=min(sum(op[i]*payoff[i][j] for i in range(64)) for j in range(64))
    ou=max(sum(payoff[i][j]*oq[j] for j in range(64)) for i in range(64))
    assert ol<=rounded_lower<=ou
    assert abs(float(ol)-oracle['lower'])<1e-8 and abs(float(ou)-oracle['upper'])<1e-8
    report['oracleCertificate']={'lower':float(ol),'upper':float(ou),'gap':float(ou-ol),'completed':oracle['completed']}
    (root/'strategy-game-certificate.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in ('rationalRow','rationalColumn')},indent=2))
