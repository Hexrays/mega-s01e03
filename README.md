# kb — the support knowledge base

## S01E03 deliverable

This repository extends the provided 4 October 2026 export. The original accepted decision
0001 is unchanged. The new signed review explains two causes and keeps five timing anomalies
visible without inventing a confirmed third cause. The later course engineering update reports
the parser fixed and the form hint not fixed because booking-v3 was retired. The two public
tickets are closed as completed and not planned, respectively, with the owner's approval.
Those desk outcomes have not been independently verified against a runnable product.

- Review source: `src/routes/kb/incidents/4471-review/+page.svx`
- Rendered review: `rendered/4471-review.html` (self-contained static capture)
- Full interactive build: `build/kb/incidents/4471-review/index.html` and `build/_app/`
- Report membership: `analysis/parser-reports.json`, `analysis/hint-reports.json`
- Replacement rule: `src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`
- Tickets: [parser](https://github.com/Hexrays/mega-s01e03/issues/1),
  [hint](https://github.com/Hexrays/mega-s01e03/issues/2)

Use Node.js 24.18.0 or later in the Node 24 line:

```sh
npm ci
npm run build
npm run check
npm test
```

Build runs SvelteKit, mdsvex and the supplied Svelte components. It also generates the report
membership lists, a count chart and a self-contained rendered review. The rendered stamp must
come from the frontmatter signature through `RenderStamp`, not a typed desk reference.
The committed HTML is a snapshot; rebuild for new data or a new review date. All paths are
relative to this repository. No public web host is required.

## Original export documentation

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
