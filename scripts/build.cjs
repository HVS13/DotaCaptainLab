const fs=require('node:fs'),path=require('node:path');
const version='2.8.8',root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),source=path.join(root,'rebuild');
for(const name of ['frame-clock.js','solver.js','detector.js','game-controls.js','daily.js','overlay.js','index.html'])fs.writeFileSync(path.join(dist,name),fs.readFileSync(path.join(source,name),'utf8').replaceAll('__DCL_VERSION__',version));
const read=name=>fs.readFileSync(path.join(dist,name),'utf8');
const itemPolicy=['strategy-challenger.cjs','strategy-risk.cjs','item-replacement.cjs'].map(name=>fs.readFileSync(path.join(root,'scripts',name),'utf8')).join('\n');
const workerSource=`const scope={};(function(window){${read('engine.js')}\n${read('solver.js')}\n})(scope);const Advisor=scope.Advisor;(function(globalThis,module){${itemPolicy}})(scope,undefined);self.onmessage=async({data})=>{try{if(data.kind==='items'){const start=performance.now(),itemResult=await scope.ItemReplacement.evaluate(data.state,data.config,data.row,data.profile,{deadline:start+data.budgetMs,now:()=>performance.now()});postMessage({itemResult});return}const row=data.cases.map(c=>Advisor.simulate(data.state,data.plan,c.choices,data.state.side,data.items,c.opponent));postMessage({row})}catch(e){postMessage({error:e.message})}};`;
const challenger=fs.readFileSync(path.join(root,'scripts/strategy-challenger.cjs'),'utf8').replace('// Research only. Exact native outcomes; no changes to production Auto.','// Native strategy shortlist used by Auto.')+'\n'+fs.readFileSync(path.join(root,'scripts/strategy-risk.cjs'),'utf8')+'\n'+fs.readFileSync(path.join(root,'scripts/strategy-challenger-workers.js'),'utf8').replace('// Browser research runner. Never loaded by production; interrupted work retains baseline.','// Browser worker runner; interrupted work retains the baseline.')+'\nglobalThis.AdvisorWorkerSource='+JSON.stringify(workerSource)+';\n';
fs.writeFileSync(path.join(dist,'challenger.js'),challenger);
const metadata=`// ==UserScript==
// @name         DotaCaptain Draft Advisor
// @namespace    https://github.com/HVS13/DotaCaptainLab
// @version      ${version}
// @description  Live native pick/ban rankings, visible-draft detection, explanations and configuration advice.
// @match        https://dotacaptain.com/*
// @grant        none
// @sandbox      raw
// @noframes
// @run-at       document-start
// @homepageURL  https://hvs13.github.io/DotaCaptainLab/
// @downloadURL  https://hvs13.github.io/DotaCaptainLab/dotacaptain-advisor.user.js
// @updateURL    https://hvs13.github.io/DotaCaptainLab/dotacaptain-advisor.user.js
// ==/UserScript==
`;
const bundle=metadata+read("frame-clock.js")+`\n(function(){'use strict';function mount(){const scope={};\n(function(window){\n${read('engine.js')}\n${read('solver.js')}\n})(scope);\n(function(globalThis,module){${challenger}})(scope,undefined);\nconst DC=scope.DC,Advisor=scope.Advisor,StrategyRisk=scope.StrategyRisk,runStrategyChallengerWorkers=scope.runStrategyChallengerWorkers,AdvisorWorkerSource=scope.AdvisorWorkerSource;\n${read('detector.js')}\n(function(window){${read('game-controls.js')}\n${read('daily.js')}})(scope);\nconst AdvisorGame=scope.AdvisorGame,AdvisorDaily=scope.AdvisorDaily;\n${read('overlay.js')}\n}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();})();\n`;
fs.writeFileSync(path.join(dist,'dotacaptain-advisor.user.js'),bundle);
fs.writeFileSync(path.join(root,'tests','overlay-fixture.js'),read('overlay.js').replace("location.hostname!=='dotacaptain.com'","false"));
fs.writeFileSync(path.join(root,'tests','bundle-fixture.js'),bundle.replace("location.hostname!=='dotacaptain.com'","false").replace("location.pathname==='/daily-challenge'","location.pathname==='/daily-challenge'||location.pathname.endsWith('/daily-fixture.html')"));
console.log('Built the standalone advisor and self-contained userscript.');
