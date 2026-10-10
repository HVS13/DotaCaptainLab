// Offline anytime double-oracle: publish only fully checked global response bounds.
const {solve}=require('./strategy-game.cjs');
function solveBounded(rowCount,columnCount,get,{initialRow=0,initialColumns=[0],deadline=Infinity,now=()=>performance.now(),tolerance=1e-7,progress=()=>{}}={}){
 const rows=[initialRow],columns=[...new Set(initialColumns)],cache=new Map(),expired=Symbol('deadline');let calls=0,iterations=0,last=null;
 function read(i,j){const key=i+':'+j;if(cache.has(key))return cache.get(key);if(now()>=deadline)throw expired;const value=get(i,j);calls++;if(!Number.isFinite(value)||value<0||value>1)throw Error('Invalid oracle payoff');cache.set(key,value);if(now()>=deadline)throw expired;return value}
 try{for(;;){const sub=solve(rows.map(i=>columns.map(j=>read(i,j)))),p=Array(rowCount).fill(0),q=Array(columnCount).fill(0);rows.forEach((i,k)=>p[i]=sub.row[k]);columns.forEach((j,k)=>q[j]=sub.column[k]);let lower=Infinity,upper=-Infinity,worstColumn=-1,bestRow=-1;
   for(let j=0;j<columnCount;j++){let score=0;for(const i of rows)if(p[i]>0)score+=p[i]*read(i,j);if(score<lower){lower=score;worstColumn=j}}
   for(let i=0;i<rowCount;i++){let score=0;for(const j of columns)if(q[j]>0)score+=q[j]*read(i,j);if(score>upper){upper=score;bestRow=i}}
   iterations++;const betterRow=!last||lower>last.lower,betterColumn=!last||upper<last.upper;last={row:betterRow?p:last.row,column:betterColumn?q:last.column,lower:betterRow?lower:last.lower,upper:betterColumn?upper:last.upper,worstColumn:betterRow?worstColumn:last.worstColumn,bestRow:betterColumn?bestRow:last.bestRow,iterations};last.gap=last.upper-last.lower;progress({iterations,calls,lower:last.lower,upper:last.upper,gap:last.gap});if(last.gap<=tolerance)return{...last,completed:true,calls};
   let added=false;if(!rows.includes(bestRow)){rows.push(bestRow);added=true}if(!columns.includes(worstColumn)){columns.push(worstColumn);added=true}if(!added)throw Error('Positive gap without a new response');
 }}catch(e){if(e!==expired)throw e;return last?{...last,completed:false,calls}:{completed:false,calls,certificate:null}}
}
module.exports={solveBounded};
