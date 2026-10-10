const assert=require('node:assert/strict'),{solve,sample}=require('../scripts/strategy-game.cjs'),close=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const pennies=solve([[1,0],[0,1]]);close(pennies.lower,.5);pennies.row.forEach(v=>close(v,.5));pennies.column.forEach(v=>close(v,.5));
const rps=solve([[.5,0,1],[1,.5,0],[0,1,.5]]);close(rps.lower,.5);rps.row.forEach(v=>close(v,1/3));
const dominated=solve([[1,1],[0,0]]);close(dominated.lower,1);close(dominated.row[0],1);
close(solve([[0,0],[0,0]]).lower,0);close(solve([[1,1],[1,1]]).lower,1);close(solve([[1,0,1],[0,1,1]]).lower,.5);
assert.throws(()=>solve([]));assert.throws(()=>solve([[1],[0,1]]));assert.throws(()=>solve([[NaN]]));
assert.equal(sample([0,.5,.5],()=>0),1);assert.equal(sample([0,.5,.5],()=>.5),2);assert.equal(sample([1,0],()=>.999999),0);assert.throws(()=>sample([0,0]));assert.throws(()=>sample([1],()=>1));
let seed=42;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);for(let k=0;k<20;k++){const game=Array.from({length:3+k%5},()=>Array.from({length:2+k%7},()=>Number(random()>.5))),s=solve(game);close(s.row.reduce((a,b)=>a+b,0),1);close(s.column.reduce((a,b)=>a+b,0),1);assert(s.row.every(v=>v>=0));assert(s.column.every(v=>v>=0));assert(s.gap<1e-8);const transposed=solve(game[0].map((_,j)=>game.map(row=>1-row[j])));close(s.lower+transposed.upper,1)}
console.log('Verified matching pennies, cyclic mixing, dominated/degenerate/rectangular games, probability mass, full best-response gaps and complementary-game values.');
