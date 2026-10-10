const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),source=path.join(root,'rebuild');
for(const name of ['solver.js','detector.js','game-controls.js','daily.js','overlay.js','index.html'])fs.copyFileSync(path.join(source,name),path.join(dist,name));
const read=name=>fs.readFileSync(path.join(dist,name),'utf8');
const workerSource=`const scope={};(function(window){${read('engine.js')}\n${read('solver.js')}\n})(scope);const Advisor=scope.Advisor;self.onmessage=({data})=>{try{const row=data.cases.map(c=>Advisor.simulate(data.state,data.plan,c.choices,data.state.side,data.items,c.opponent));postMessage({row})}catch(e){postMessage({error:e.message})}};`;
const challenger=fs.readFileSync(path.join(root,'scripts/strategy-challenger.cjs'),'utf8').replace('// Research only. Exact native outcomes; no changes to production Auto.','// Native strategy shortlist used by Auto.')+'\n'+fs.readFileSync(path.join(root,'scripts/strategy-challenger-workers.js'),'utf8').replace('// Browser research runner. Never loaded by production; interrupted work retains baseline.','// Browser worker runner; interrupted work retains the baseline.')+'\nglobalThis.AdvisorWorkerSource='+JSON.stringify(workerSource)+';\n';
fs.writeFileSync(path.join(dist,'challenger.js'),challenger);
const metadata=`// ==UserScript==
// @name         DotaCaptain Draft Advisor
// @namespace    https://github.com/HVS13/DotaCaptainLab
// @version      2.8.0
// @description  Live native pick/ban rankings, visible-draft detection, explanations and configuration advice.
// @match        https://dotacaptain.com/*
// @grant        none
// @noframes
// @run-at       document-idle
// @homepageURL  https://hvs13.github.io/DotaCaptainLab/
// @downloadURL  https://hvs13.github.io/DotaCaptainLab/dotacaptain-advisor.user.js
// @updateURL    https://hvs13.github.io/DotaCaptainLab/dotacaptain-advisor.user.js
// ==/UserScript==
`;
const bundle=metadata+`\n(function(){'use strict';const scope={};\n(function(window){\n${read('engine.js')}\n${read('solver.js')}\n})(scope);\n(function(globalThis,module){${challenger}})(scope,undefined);\nconst DC=scope.DC,Advisor=scope.Advisor,runStrategyChallengerWorkers=scope.runStrategyChallengerWorkers,AdvisorWorkerSource=scope.AdvisorWorkerSource;\n${read('detector.js')}\n(function(window){${read('game-controls.js')}\n${read('daily.js')}})(scope);\nconst AdvisorGame=scope.AdvisorGame,AdvisorDaily=scope.AdvisorDaily;\n${read('overlay.js')}\n})();\n`;
fs.writeFileSync(path.join(dist,'dotacaptain-advisor.user.js'),bundle);
fs.writeFileSync(path.join(root,'tests','overlay-fixture.js'),read('overlay.js').replace("location.hostname!=='dotacaptain.com'","false"));
fs.writeFileSync(path.join(root,'tests','bundle-fixture.js'),bundle.replace("location.hostname!=='dotacaptain.com'","false").replace("location.pathname==='/daily-challenge'","location.pathname==='/daily-challenge'||location.pathname.endsWith('/daily-fixture.html')"));
console.log('Built the standalone advisor and self-contained userscript.');
