const assert=require('node:assert/strict'),S=require('../scripts/draft-personality-analysis.cjs');
assert.equal(S.entropy(new Map([[1,1],[2,1]])),1);
const rows=Array.from({length:8},(_,i)=>({side:i%2?'dire':'radiant',opponentMode:i%4<2?'weighted':'greedy',styles:{standard:{wins:0,total:16,severeLosses:16,firstPick:1,firstBan:1},creative:{wins:16,total:16,severeLosses:0,firstPick:2,firstBan:2}}}));
const score=S.summarize(rows);assert.equal(score.successDelta,.05);assert.equal(score.severeLossDelta,-.05);assert(score.firstPickEntropyDelta>0);const result=S.analyze(rows,100);assert.equal(result.draftClusters,8);assert.equal(result.scenarioCases,128);assert.equal(result.bounds.successLower95,.05);assert.equal(result.passes,true);
const smaller=S.analyze(rows,100,.04);assert.equal(smaller.point.successDelta,.04);assert.equal(smaller.point.severeLossDelta,-.04);assert.equal(smaller.mixture.creative,.04);
const same=rows.map(r=>({...r,styles:{standard:r.styles.standard,creative:r.styles.standard}}));const tie=S.analyze(same,100);assert.equal(tie.point.successDelta,0);assert.equal(tie.point.entropySumDelta,0);assert.equal(tie.passes,false);assert.equal(tie.checks.diversity,false);
console.log('Verified hand-calculated 95/5 mixture effects, entropy, paired draft-cluster denominators, and rejection when diversity does not improve.');
