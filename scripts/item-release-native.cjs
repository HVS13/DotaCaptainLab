// Reuse the established native demo test with separate release evidence.
// Flags: --chrome --unknown-scout --hide-draft (genuine minimized test),
// or --chrome --unknown-scout --foreground (foreground control).
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),file=path.join(__dirname,'auto-real-background.cjs');let source=fs.readFileSync(file,'utf8');
source=source.replace("chrome?'auto-chrome-background-native.json'","chrome?(foreground?'item-release-foreground-native.json':'item-release-minimized-native.json')");
if(process.argv.includes('--foreground'))source=source.replace("await b.send('Emulation.setFocusEmulationEnabled',{enabled:true});", "{const {targetInfo}=await b.send('Target.getTargetInfo');const {windowId}=await b.send('Browser.getWindowForTarget',{targetId:targetInfo.targetId});await b.send('Browser.setWindowBounds',{windowId,bounds:{windowState:'normal'}})}await b.send('Emulation.setFocusEmulationEnabled',{enabled:true});");
// A separate native application probe forces one legal replacement after the
// real optimizer, solely to ensure all actual item-control paths are exercised.
// This does not qualify a decision; generated-worker parity is checked elsewhere.
if(process.argv.includes('--item-application-probe')){
 require('../dist/engine.js');require('../dist/solver.js');const factory=require('./item-replacement.cjs').candidates.toString(),injection=`config=challenged;if(config){const proposed=((A,D)=>(${factory})(state,config.itemBuilds))(Advisor,DC)[0];if(!proposed)throw Error('Application probe has no legal item replacement');window.__itemApplicationProbe={heroId:proposed.heroId,slot:proposed.slot,from:proposed.from,to:proposed.to};config={...config,itemBuilds:proposed.itemBuilds}}renderContent();`;
 source=source.replace("if(unknown)bundle=bundle.replace(",`bundle=bundle.replace('config=challenged;renderContent();',${JSON.stringify(injection)});if(unknown)bundle=bundle.replace(`).replace('const report={browser:',"const itemApplicationProbe=await b.evaluate('window.__itemApplicationProbe||null');const report={itemApplicationProbe,browser:").replace('assert(record,\'Auto did not finish\');',"assert(record,'Auto did not finish');assert(itemApplicationProbe,'Legal replacement was not injected');assert.equal(record.selectedItems[itemApplicationProbe.heroId][itemApplicationProbe.slot],itemApplicationProbe.to);");
}
const compiled=new Module(file,module);compiled.filename=file;compiled.paths=module.paths;compiled._compile(source,file);
