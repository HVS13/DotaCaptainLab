"""Independent outcome/qualification and paired-cluster bootstrap verification."""
import json,math
from pathlib import Path
root=Path(__file__).resolve().parent.parent/'docs/research'
protocol=json.loads((root/'strategy-challenger-protocol.json').read_text())
rows=sorted([r for start in (0,4,8,12) for r in json.loads((root/f'strategy-challenger-part-{start}.json').read_text())['results']],key=lambda r:r['index'])
report=json.loads((root/'strategy-challenger-analysis.json').read_text())
assert len(rows)==16
groups={}
for i,row in enumerate(rows):
    assert row['index']==i and row['seed']==protocol['seedStart']+i*104729
    c=row['challenger']; size=len(c['profile']['plans']); count=len(c['profile']['variants'])
    assert c['completed'] and len(c['rows'])==len(c['plans'])<=4
    metrics=[]
    for outcomes in c['rows']:
        assert len(outcomes)==size*count
        metrics.append([(sum(t['win'] for t in outcomes[k*size:(k+1)*size]),sum(not t['win'] and t['nw'] < -20000 for t in outcomes[k*size:(k+1)*size]),sum(t['nw'] for t in outcomes[k*size:(k+1)*size])/size) for k in range(count)])
    base=metrics[0]
    eligible=[j for j,v in enumerate(metrics) if j and all(a[0]>=b[0] and a[1]<=b[1] for a,b in zip(v,base)) and any(a[0]>b[0] or a[1]<b[1] for a,b in zip(v,base))]
    ranked=sorted(eligible,key=lambda j:(-min(v[0] for v in metrics[j]),-sum(v[0] for v in metrics[j]),sum(v[1] for v in metrics[j]),-sum(v[2] for v in metrics[j]),j))
    assert c['index']==(ranked[0] if ranked else 0) and sorted(c['eligible'])==eligible
    assert row['styles']['standard']['choices']==row['baselineConfig']['choices'] and row['styles']['challenger']['choices']==c['plans'][c['index']]
    for style in row['styles'].values():
        assert style['total']==16 and len(style['tests'])==16
        assert style['wins']==sum(t['win'] for t in style['tests'])
        assert style['severeLosses']==sum(not t['win'] and t['nw'] < -20000 for t in style['tests'])
        assert style['firstPick']==row['styles']['standard']['firstPick'] and style['firstBan']==row['styles']['standard']['firstBan']
    for p in row['profiles']:
        assert all(p['opponent']['roles']!=v['roles'] or p['opponent']['items']!=v['items'] for v in c['profile']['variants'])
    groups.setdefault(row['side']+'/'+row['opponentMode'],[]).append(row)
assert len(groups)==8 and all(len(v)==2 for v in groups.values())
def delta(sample,metric):
    return sum(r['styles']['challenger'][metric]-r['styles']['standard'][metric] for r in sample)/(16*len(sample))
seed=99173
def rand():
    global seed
    seed=(seed*1664525+1013904223)&0xffffffff
    return seed/4294967296
win,severe=[],[]
for _ in range(10000):
    sample=[g[math.floor(rand()*len(g))] for g in groups.values() for _ in g]
    win.append(delta(sample,'wins'));severe.append(delta(sample,'severeLosses'))
lower=sorted(win)[math.floor(9999*.05)];upper=sorted(severe)[math.floor(9999*.95)]
assert abs(lower-report['bounds']['successLower95'])<1e-12 and abs(upper-report['bounds']['severeLossUpper95'])<1e-12
assert abs(delta(rows,'wins')-report['point']['successDelta'])<1e-12 and abs(delta(rows,'severeLosses')-report['point']['severeLossDelta'])<1e-12
assert report['passes']==(lower>=-.005 and upper<=.005)
out={'status':'passed','draftPairs':16,'qualificationAndOutcomeCounts':'independently matched','bootstrapBoundsMatched':True,'successLower95':lower,'severeLossUpper95':upper,'candidateAcceptedForFurtherChecks':report['passes'],'scope':'Fixed diagnostic simulator batch, not live PvP certification.'}
(root/'strategy-challenger-certificate.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
