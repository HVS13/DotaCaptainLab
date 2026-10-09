const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),source=path.join(root,'rebuild');
for(const name of ['solver.js','detector.js','game-controls.js','overlay.js','index.html'])fs.copyFileSync(path.join(source,name),path.join(dist,name));
const read=name=>fs.readFileSync(path.join(dist,name),'utf8');
const metadata=`// ==UserScript==
// @name         DotaCaptain Draft Advisor
// @namespace    https://github.com/HVS13/DotaCaptainLab
// @version      2.5.0
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
const bundle=metadata+`\n(function(){'use strict';const scope={};\n(function(window){\n${read('engine.js')}\n${read('solver.js')}\n})(scope);\nconst DC=scope.DC,Advisor=scope.Advisor;\n${read('detector.js')}\n(function(window){${read('game-controls.js')}})(scope);\nconst AdvisorGame=scope.AdvisorGame;\n${read('overlay.js')}\n})();\n`;
fs.writeFileSync(path.join(dist,'dotacaptain-advisor.user.js'),bundle);
fs.writeFileSync(path.join(root,'tests','overlay-fixture.js'),read('overlay.js').replace("location.hostname!=='dotacaptain.com'","false"));
fs.writeFileSync(path.join(root,'tests','bundle-fixture.js'),bundle.replace("location.hostname!=='dotacaptain.com'","false"));
console.log('Built the standalone advisor and self-contained userscript.');
