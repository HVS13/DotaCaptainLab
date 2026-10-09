const assert=require('node:assert/strict'),C=require('../scripts/check-source-freshness.cjs');
(async()=>{const page='https://dotacaptain.com/draft',asset='https://dotacaptain.com/_next/static/chunks/test.js',html=Buffer.from('<script src="/_next/static/chunks/test.js"></script><script src="https://other.example/test.js"></script>'),data=Buffer.from('native code'),baseline={pages:[{url:page,assets:[asset]}],assets:[{url:asset,sha256:C.hash(data)}]},read=async url=>url===page?html:data;
 assert.deepEqual(C.assetURLs(html.toString(),page),[asset]);assert.equal((await C.inspect(baseline,read)).status,'unchanged');
 const changed=await C.inspect(baseline,async url=>url===page?html:Buffer.from('new formula'));assert.equal(changed.status,'changed');assert.equal(changed.changes[0].kind,'content');
 const replacement=await C.inspect(baseline,async url=>url===page?Buffer.from('<script src="/_next/static/chunks/new.js"></script>'):data);assert.equal(replacement.status,'changed');assert(replacement.changes.some(c=>c.kind==='removed'));assert(replacement.changes.some(c=>c.kind==='added'));
 assert.equal((await C.inspect(baseline,async()=>{throw Error('offline')})).status,'unavailable');assert.equal((await C.inspect(baseline,async()=>Buffer.from('<html>Unavailable</html>'))).status,'unavailable');
 assert.equal((await C.inspect(baseline,async url=>{if(url===page)return html;throw Error('HTTP 503')})).status,'unavailable');
 console.log('Verified unchanged assets, changed bytes, replaced asset URLs, external-source exclusion and unavailable checks never reported as current.');
})().catch(e=>{console.error(e);process.exitCode=1});
