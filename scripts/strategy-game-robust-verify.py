"""Independent expanded-game certificate and artifact checks, using stdlib rationals."""
import json
from fractions import Fraction as F
from pathlib import Path
root=Path(__file__).resolve().parent.parent/'docs/research'
r=json.loads((root/'strategy-game-robust.json').read_text())
old=json.loads((root/'strategy-game-analysis.json').read_text())
reference=json.loads((root/'strategy-game-matrix.json').read_text())
a=r['payoff']; m,n=64,256
assert len(a)==m and all(len(row)==n and all(v in (0,1) for v in row) for row in a)
assert len(r['cells'])==m and all(len(row)==n for row in r['cells'])
assert r['engineSha256']==reference['engineSha256'] and r['plans']==reference['plans']
assert len(r['variants'])==4 and r['newSimulations']==12288 and r['cachedReferenceCells']==4096
for i in range(m):
    assert r['cells'][i][:64]==reference['cells'][i]
    assert all(int(cell['win'])==a[i][j] for j,cell in enumerate(r['cells'][i]))
for j,c in enumerate(r['columns']):
    assert c['variant']==j//64 and c['plan']==j%64 and c['choices']==r['plans'][j%64]
def distribution(values,size):
    w=[F(str(v)) for v in values]
    assert len(w)==size and all(v>=0 for v in w) and abs(sum(w)-1)<F(1,10**8)
    return [v/sum(w) for v in w]
def bounds(p,q):
    return min(sum(p[i]*a[i][j] for i in range(m)) for j in range(n)),max(sum(a[i][j]*q[j] for j in range(n)) for i in range(m))
p=distribution(r['solution']['row'],m); q=distribution(r['solution']['column'],n)
lo,hi=bounds(p,q)
assert 0<=lo<=hi<=1 and hi-lo<F(1,10**7)
assert abs(float(lo)-r['solution']['lower'])<1e-8 and abs(float(hi)-r['solution']['upper'])<1e-8
rp=[v.limit_denominator(10**6) for v in p]; rq=[v.limit_denominator(10**6) for v in q]
exact=None
if sum(rp)==sum(rq)==1:
    rl,ru=bounds(rp,rq)
    if rl==ru: exact=str(rl)
policies=[('robustMixture',p),('referenceMixture',distribution(old['solution']['row'],m))]
risks={}
for field,weights in policies:
    risks[field]=[]
    for k,result in enumerate(r[field]):
        returns=[sum(weights[i]*a[i][k*64+j] for i in range(m)) for j in range(64)]
        assert abs(float(min(returns))-result['lower'])<1e-8
        assert abs(float(sum(returns)/64)-result['uniformMean'])<1e-8
        severe=[sum(weights[i]*int(not r['cells'][i][k*64+j]['win'] and r['cells'][i][k*64+j]['nw'] < -20000) for i in range(m)) for j in range(64)]
        risks[field].append({'variant':r['variants'][k]['label'],'worstSevereLossUtility':float(max(severe)),'uniformSevereLossMean':float(sum(severe)/64)})
base=a[r['baseline']['index']]
assert r['baseline']['index']==old['baseline']['index'] and sum(base)==r['baseline']['wins'] and min(base)==r['baseline']['worst']
assert max(min(row) for row in a)==r['pureMaximin']
assert [i for i,row in enumerate(a) if all(v>=base[j] for j,v in enumerate(row))]==r['baselineDominatingRows']
sensitivity=json.loads((root/'strategy-game-sensitivity.json').read_text())
for k,previous in enumerate(sensitivity['results'],1):
    assert previous['variant']==r['variants'][k]['label']
    assert abs(previous['unchangedMixtureLower']-r['referenceMixture'][k]['lower'])<1e-8
    assert abs(previous['unchangedMixtureUniformMean']-r['referenceMixture'][k]['uniformMean'])<1e-8
previous=policies[1][1]
changes=[sum((p[i]-previous[i])*a[i][j] for i in range(m)) for j in range(n)]
old_exact=[v.limit_denominator(10**6) for v in previous]
assert sum(old_exact)==1
target=rp if exact else p
margin=F(1,200)  # Existing 0.5 pp tolerance, applied here only to modeled uniform means.
alpha=F(1)
def means(weights,k):
    win=sum(weights[i]*sum(a[i][k*64:(k+1)*64]) for i in range(m))/64
    severe=sum(weights[i]*sum(int(not cell['win'] and cell['nw'] < -20000) for cell in r['cells'][i][k*64:(k+1)*64]) for i in range(m))/64
    return win,severe
for k in range(4):
    ow,os=means(old_exact,k); nw,ns=means(target,k)
    if ow>nw: alpha=min(alpha,margin/(ow-nw))
    if ns>os: alpha=min(alpha,margin/(ns-os))
blended=[(1-alpha)*old_exact[i]+alpha*target[i] for i in range(m)]
assert sum(blended)==1 and all(v>=0 for v in blended)
checks=[]
for k in range(4):
    ow,os=means(old_exact,k); bw,bs=means(blended,k)
    assert bw>=ow-margin and bs<=os+margin
    lower=min(sum(blended[i]*a[i][k*64+j] for i in range(m)) for j in range(64))
    checks.append({'variant':r['variants'][k]['label'],'lower':float(lower),'uniformMean':float(bw),'uniformWinDelta':float(bw-ow),'uniformSevereLossMean':float(bs),'uniformSevereLossDelta':float(bs-os)})
blend_lower=min(sum(blended[i]*a[i][j] for i in range(m)) for j in range(n))
old_lower=min(sum(old_exact[i]*a[i][j] for i in range(m)) for j in range(n))
assert blend_lower>=old_lower
bounded={'targetShare':float(alpha),'exactTargetShare':str(alpha),'row':[str(v) for v in blended],'lower':float(blend_lower),'exactLower':str(blend_lower),'referenceExpandedLower':float(old_lower),'uniformMargin':float(margin),'perVariant':checks,'interpretation':'Largest step along the reference-to-minimax mixture segment satisfying per-variant uniform win decrease and severe-loss increase caps of 0.5 percentage points. Feasible modeled compromise, not the optimal general constrained policy, a statistical acceptance pass or evidence of PvP non-regression.'}
report={'status':'passed','rows':m,'columns':n,'exactRawLower':str(lo),'exactRawUpper':str(hi),'gap':float(hi-lo),'rationalGameValue':exact,'rationalRow':[str(v) for v in rp] if exact else None,'rationalColumn':[str(v) for v in rq] if exact else None,'referenceBlockMatched':True,'priorSensitivityMatched':True,'baselineCountsMatched':True,'severeLossThreshold':-20000,'severeLossRisk':risks,'pointwiseComparison':{'improvedColumns':sum(v>F(1,10**8) for v in changes),'regressedColumns':sum(v < -F(1,10**8) for v in changes),'largestLoss':float(min(changes)),'largestGain':float(max(changes))},'scope':'Independent arithmetic over every response in the four-variant modeled table. Severe loss means a modeled loss with signed final net worth below -20000. Native outputs independently replayed only by the separate sampled checker; no PvP validation.'}
report['boundedMixture']=bounded
(root/'strategy-game-robust-certificate.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'status':report['status'],'rationalGameValue':exact,'gap':float(hi-lo),'boundedMixture':{k:v for k,v in bounded.items() if k!='row'}},indent=2))
