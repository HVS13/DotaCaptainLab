const assert = require('node:assert/strict');
const path = require('node:path');
require('../dist/engine.js');
require('../dist/model.js');
require('../dist/flow.js');
require('../dist/general.js');
const D = globalThis.DC, L = globalThis.Lab;
const data = require('../dist/general-baseline.json');
assert.equal(D.heroes.length, 127);
assert.equal(new Set(L.plans.map(p => JSON.stringify(p))).size, 64);
assert.equal(D.flow.sequence.length, 24);
assert.equal(D.flow.sequence.filter(x => x.action === 'pick').length, 10);
assert.equal(data.teams.length, 120);
let matches = 0;
for (const t of data.teams) {
  assert.equal(new Set(t.ids).size, 5);
  assert(t.ids.every((id, i) => L.valid(L.byId.get(id), L.roles[i])));
  assert.deepEqual(L.defaultBuilds(t.ids), Object.fromEntries(t.ids.map((id, i) => [id, D.builds.z8(id, L.roles[i])])));
  const g = t.overall, results = g.opponents.flatMap(e => e.tests);
  assert.equal(results.length, 512);
  assert.equal(g.wins, results.filter(s => s.win).length);
  assert.equal(g.meanNetworthLead, results.reduce((n, s) => n + s.networthLead, 0) / results.length);
  for (const e of g.opponents) {
    assert.equal(new Set([...t.ids, ...e.ids]).size, 10);
    assert(e.ids.every((id, i) => L.valid(L.byId.get(id), L.roles[i])));
    assert.deepEqual(e.tests.map(s => s.side), ['radiant', 'dire']);
    assert.equal(e.wins, e.tests.filter(s => !s.win).length);
  }
  for (const replicate of [0, 1]) {
    const entries = g.opponents.filter(e => e.replicate === replicate);
    assert.equal(entries.length, 128);
    for (let plan = 0; plan < 64; plan++) assert.equal(entries.filter(e => e.plan === plan).length, 2);
  }
  const mass = g.opponents.reduce((n, e) => n + 2 * L.soloPrior[e.plan], 0);
  const weightedWins = g.opponents.reduce((n, e) => n + L.soloPrior[e.plan] * e.tests.filter(s => s.win).length, 0);
  assert(Math.abs(L.soloBenchmark(g).rate - weightedWins / mass) < 1e-12);
  matches += results.length;
}
assert.equal(matches, 61440);
const t = data.teams[0], opponent = t.overall.opponents[0];
for (const saved of opponent.tests) {
  const replay = L.run(t, opponent.ids, opponent.choices, saved.side, L.roleMap(opponent.ids));
  assert.equal(replay.win, saved.win);
  assert.equal(replay.networthLead, saved.networthLead);
  assert.equal(replay.minute, saved.minute);
}
assert.throws(() => L.run(t, t.ids, opponent.choices), /different|unique/);
const candidates = L.search({ locks: { carry: t.ids[0] }, bans: [opponent.ids[0]], limit: 5, samples: 30 });
assert(candidates.length > 0);
assert(candidates.every(x => x.ids[0] === t.ids[0] && !x.ids.includes(opponent.ids[0])));
console.log(`Verified ${data.teams.length} teams, ${matches} stored results, legal roles, source presets, balanced profiles, Solo weights and native replay.`);
require('../dist/quick-model.js');
const idFor = name => D.heroes.find(h => h.localized_name === name).id;
const muerta = idFor('Muerta'), mirana = idFor('Mirana'), axe = idFor('Axe');
const quickArgs = { locks: { carry: muerta, mid: mirana }, bans: [axe], reference: data.teams.map(t => ({ ids: t.ids, choices: t.choices })), focus: data.teams.find(t => t.ids[0] === muerta && t.ids[1] === mirana) };
const replacements = L.quickTeams(quickArgs);
assert(replacements.length > 0);
assert(replacements.every(t => t.ids[0] === muerta && t.ids[1] === mirana && !t.ids.includes(axe) && new Set(t.ids).size === 5));
assert(replacements.every(t => t.ids.every((id, i) => L.valid(L.byId.get(id), L.roles[i]))));
assert.deepEqual(L.quickTeams(quickArgs), replacements);
const completed = replacements[0], fixed = L.quickTeams({ locks: Object.fromEntries(L.roles.map((r, i) => [r, completed.ids[i]])), bans: [axe] });
assert.equal(fixed.length, 1);
assert.deepEqual(fixed[0].ids, completed.ids);
assert.equal(fixed[0].score, Math.max(...L.plans.map(p => L.score(completed.ids, p).score)));
assert.throws(() => L.quickTeams({ locks: { carry: muerta }, bans: [muerta] }), /unavailable/);
console.log('Verified Muerta/Mirana locks, banned Axe replacements, deterministic quick search and best native configuration across all 64 plans.');
