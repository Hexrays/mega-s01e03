import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { groupByCause, uniqueById } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const root = resolve(import.meta.dirname, '..');
const data = resolve(root, 'src/lib/data');
const raw = JSON.parse(await readFile(resolve(data, 'reports-4471.json'), 'utf8'));
const tenants = new Map(await Promise.all((await readdir(resolve(data, 'tenants'))).map(async (f) => {
  const t = JSON.parse(await readFile(resolve(data, 'tenants', f), 'utf8'));
  return [t.handle, t];
})));
const reports = uniqueById(raw).filter((r) => r.mergedInto === 4471);
const groups = groupByCause(reports, (r) => tenants.get(r.tenant));
await mkdir(resolve(root, 'analysis'), { recursive: true });
for (const g of groups) {
  await writeFile(resolve(root, 'analysis', g.cause + '-reports.json'), JSON.stringify({
    cause: g.cause, count: g.reports.length, firstSeen: g.firstSeen, lastSeen: g.lastSeen,
    reportIds: g.reports.map((r) => r.id).sort(),
  }, null, 2) + '\n');
}
const page = await readFile(resolve(root, 'src/routes/kb/incidents/4471-review/+page.svx'), 'utf8');
const signature = page.match(/^signature: (.+)$/m)?.[1];
if (!signature) throw new Error('The review page needs its course-issued signature.');
console.log(JSON.stringify({
  rows: raw.length, uniqueReports: reports.length,
  groups: groups.map(({ cause, reports, taggedAs, firstSeen, lastSeen }) => ({ cause, count: reports.length, taggedAs, firstSeen, lastSeen })),
  deskRef: deskRef(signature),
}, null, 2));
const bars = groups.map((g) => '<div class="row"><span>' + g.cause + '</span><div class="track"><div class="bar ' + g.cause + '" style="width:' + (g.reports.length / reports.length * 100) + '%"></div></div><b>' + g.reports.length + '</b></div>').join('');
await writeFile(resolve(root, 'analysis/findings.html'), '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:var(--font-sans);color:var(--foreground)}.row{display:grid;grid-template-columns:60px 1fr 40px;gap:12px;align-items:center;margin:14px 0}.track{background:var(--secondary);border-radius:var(--radius);height:24px}.bar{height:24px;border-radius:var(--radius);min-width:4px}.parser{background:var(--chart-1)}.hint{background:var(--chart-2)}p{color:var(--muted-foreground);font-size:14px}</style></head><body><h3>#4471 · unique reports by cause</h3>' + bars + '<p>' + reports.length + ' unique reports from ' + raw.length + ' rows. Five timing anomalies remain included under parser and need investigation.</p></body></html>');
