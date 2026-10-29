import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { causeOf, dayFirst, groupByCause, sameCause, uniqueById } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';
import { daysSince, STALE_AFTER_DAYS } from '../src/lib/kb/staleness.ts';
const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const raw = JSON.parse(read('src/lib/data/reports-4471.json'));
const reports = uniqueById(raw);
const tenants = new Map(readdirSync(new URL('../src/lib/data/tenants', import.meta.url)).map((f) => {
  const t = JSON.parse(read('src/lib/data/tenants/' + f)); return [t.handle, t];
}));
const t = (handle) => tenants.get(handle);
const groups = groupByCause(reports.filter((r) => r.mergedInto === 4471), (r) => t(r.tenant));

test('export overlap is counted once, and no report is lost', () => {
  assert.equal(raw.length, 427); assert.equal(reports.length, 412);
  assert.deepEqual(groups.map((g) => [g.cause, g.reports.length]), [['parser', 379], ['hint', 33]]);
  assert.equal(groups.flatMap((g) => g.reports).length, 412);
});
test('classify by tenant and form, not browser locale or intake tag', () => {
  assert.equal(dayFirst('fr-FR'), true); assert.equal(dayFirst('en-US'), false);
  assert.equal(causeOf({channel:'form'}, t('alder.physio')), 'hint');
  assert.equal(causeOf({channel:'app'}, t('alder.physio')), 'parser');
  assert.equal(causeOf({channel:'form'}, t('morrow.tax')), 'parser');
  assert.equal(causeOf({channel:'email'}, undefined), null);
  assert.equal(causeOf({channel:'form'}, {...t('alder.physio'), locale:'en-US'}), null);
  assert.equal(groups.reduce((n,g) => n + g.reports.filter(r => r.meta.intakeTag !== g.cause).length, 0), 38);
});
test('matching subjects are not required or sufficient', () => {
  assert.equal(sameCause({channel:'app'},t('kettle.books'),{channel:'email'},t('kettle.books')), true);
  assert.equal(sameCause({channel:'form'},t('alder.physio'),{channel:'app'},t('alder.physio')), false);
  assert.equal(sameCause({channel:'form'},t('copper.studio'),{channel:'form'},t('morrow.tax')), false);
  assert.equal(sameCause({channel:'email'},undefined,{channel:'email'},undefined), false);
});
test('all five timing anomalies remain visible without double counting', () => {
  const ids = JSON.parse(read('src/lib/data/desk-notes.json')).oneDayMove;
  assert.equal(ids.length,5);
  for(const id of ids) assert.ok(groups.find(g => g.cause === 'parser').reports.some(r=>r.id===id));
});
test('old accepted decision is overdue for review', () => {
  assert.ok(daysSince('2024-06-11', new Date('2026-10-29T00:00:00Z')) > STALE_AFTER_DAYS);
});
test('compiled page contains actual counts, examples and derived desk ref', () => {
  const html = read('build/kb/incidents/4471-review/index.html');
  assert.match(html, /379/); assert.match(html, /33/);
  assert.match(html, /same subject, same channel, different tenant/);
  assert.match(html, /5 reports read as a one-day move/);
  assert.ok(html.includes(deskRef('OpenAI coding harness for Hexrays · S01E03')));
  assert.doesNotMatch(html, /no desk ref:/);
  assert.match(html, /183 reports arrived before 2 July/);
});
