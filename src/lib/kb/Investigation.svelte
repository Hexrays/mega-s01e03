<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, readAs, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const raw = reports as Report[];
  const merged = uniqueById(raw).filter((r) => r.mergedInto === 4471);
  const groups = groupByCause(merged, tenantOf);
  const duplicateRows = raw.filter((r) => r.mergedInto === 4471).length - merged.length;
  const mismatches = groups.reduce((n, g) => n + g.reports.filter((r) => r.meta.intakeTag !== g.cause).length, 0);
  const oneDay = merged.filter((r) => notes.oneDayMove.includes(r.id));
  const early = merged.filter((r) => r.receivedAt.slice(0, 10) < '2026-07-02').length;
  const batch = merged.filter((r) => r.mergedAt?.startsWith('2026-07-02')).length;
  const later = merged.filter((r) => r.receivedAt.slice(0, 10) > '2026-09-30').length;
  const months = [...new Set(merged.map((r) => r.receivedAt.slice(0, 7)))].sort();
  const rows = months.map((month) => ({
    month,
    values: groups.map((g) => g.reports.filter((r) => r.receivedAt.startsWith(month)).length),
  }));
  const max = Math.max(...rows.map((r) => r.values.reduce((a, b) => a + b, 0)));
  const tickets: Record<string, string> = {
    parser: 'https://github.com/Hexrays/mega-s01e03/issues/1',
    hint: 'https://github.com/Hexrays/mega-s01e03/issues/2',
  };
</script>

<h2>Count each report once</h2>
<p>{raw.length} exported rows contain <strong>{merged.length} unique reports</strong> merged into #4471.
Remove {duplicateRows} overlapping rows by report ID before grouping.
Tenant locale and form determine the cause; {mismatches} intake tags disagree with that classification.</p>

<table>
  <thead><tr><th>Problem / ticket</th><th>Reports</th><th>Tenants</th><th>Received</th><th>One-day notes included</th></tr></thead>
  <tbody>
    {#each groups as g (g.cause)}
      <tr>
        <td><a href={tickets[g.cause]}>{g.cause === 'parser' ? 'Shared parser reads month first' : 'booking-v3 date hint contradicts its parser'}</a></td>
        <td>{g.reports.length}</td><td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td><td>{readAs(g, notes.oneDayMove)}</td>
      </tr>
    {/each}
  </tbody>
</table>

<h2>Reports continued while the desk merged them</h2>
<p>{early} reports arrived before 2 July. The desk merged {batch} reports on 2 July.
A merge is a desk action, not the time a bug started and not proof of a fix.
Another {later} reports arrived after the old incident page's 30 September review.</p>

<figure>
  <svg viewBox="0 0 640 240" role="img" aria-label="Monthly reports by cause. Parser reports continue from April through October; hint reports run from April through September.">
    {#each rows as row, i (row.month)}
      {@const parserHeight = row.values[0] / max * 170}
      {@const hintHeight = row.values[1] / max * 170}
      <rect class="parser" x={i * 88 + 24} y={190 - parserHeight} width="45" height={parserHeight} />
      <rect class="hint" x={i * 88 + 24} y={190 - parserHeight - hintHeight} width="45" height={hintHeight} />
      <text x={i * 88 + 46} y={180 - parserHeight - hintHeight}>{row.values[0] + row.values[1]}</text>
      <text x={i * 88 + 46} y="210">{row.month.slice(5)}</text>
    {/each}
  </svg>
  <figcaption>2026 · <span class="key parser"></span> parser · <span class="key hint"></span> hint. October covers only 1–4 October.</figcaption>
</figure>
<table>
  <thead><tr><th>Month</th>{#each groups as g (g.cause)}<th>{g.cause}</th>{/each}</tr></thead>
  <tbody>{#each rows as row (row.month)}<tr><td>{row.month}</td>{#each row.values as n}<td>{n}</td>{/each}</tr>{/each}</tbody>
</table>

<h2>Do not hide reports that do not fit the explanation</h2>
<p>{oneDay.length} reports have one-day or timing descriptions. The supplied classifier files all of them under parser by tenant and channel.
They remain included in that count, not counted again as a confirmed third cause.
Their bodies do not establish a month/day swap. Review original invite payloads, time zones, send logs and intended dates before deciding whether to split them.</p>
<ul>
  {#each oneDay as r (r.id)}
    <li><code>{r.id}</code> · {r.tenant} · {r.channel}: <q>{r.body}</q></li>
  {/each}
</ul>

<style>
  svg { width: 100%; max-width: 640px; height: 240px; }
  .parser { fill: var(--accent); background: var(--accent); }
  .hint { fill: var(--warn); background: var(--warn); }
  text { fill: var(--fg); font: 12px var(--mono); text-anchor: middle; }
  .key { display: inline-block; width: 0.7em; height: 0.7em; }
  figcaption { color: var(--muted); font-size: 0.85rem; }
</style>
