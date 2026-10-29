## Problem

The shared date parser reads input month first for tenants whose date order is day first.
An ambiguous date can swap the intended day and month in a calendar invite.

## Reports covered: 379

These are unique reports from ticket #4471, not raw export rows or intake tags.
The provided export has 427 rows but 412 unique report IDs; 15 rows overlap.
The supplied classifier assigns 379 reports to parser and 33 to the separate form-hint defect.

- 11 tenants; received 2026-04-01 through 2026-10-04.
- Membership: [parser-reports.json](https://github.com/Hexrays/mega-s01e03/blob/main/analysis/parser-reports.json).
- The intake tags for this group are parser ×356 and hint ×23. Tags are not the cause.
- Classification uses tenant locale, tenant form version and report channel.
- The count includes five unresolved timing anomalies listed below. It is a routing count,
  not proof that all 379 have the same root cause.

## Evidence and conditions

Tenant locales come from `src/lib/data/tenants/*.json`, not browser locale.
Date order is derived with `Intl.DateTimeFormat`.
A day-first tenant report is assigned here unless it came through a booking-v3 form
whose displayed hint starts with MM. That condition belongs in the separate hint ticket.

- R-41200, Harbour Dental, app, en-GB, booking-v2: “Our 7 April reminder went out on 4 July.”
- R-41201 reverses those dates in its report.
- R-41205, Morrow Tax, app: 3 October became 10 March. Its browser is en-US and intake
  guessed hint, but the tenant is fr-FR and this is not a booking-v3 form report.

The export does not contain a runnable product parser. These are report evidence and the
supplied classification model, not a claim that we reproduced the production defect.

## Required fix and checks

Read dates in the tenant's supported date order or use an unambiguous date representation.
Test ambiguous dates, days above 12, invalid dates, day-first and month-first locales,
and app/email/form entry paths. Check final invite dates end to end.
Do not treat a shared-parser change as a fix for the separate misleading booking-v3 hint.

## Unresolved timing anomalies

R-41202, R-41209, R-41236, R-41344 and R-41620 describe a one-day shift or timing anomaly.
The supplied code files all five under parser by tenant/channel, but their bodies do not
prove a month/day swap. Inspect original invite payloads, intended dates, time zones and
send logs before moving them to a separate cause. Do not double count them.
No evidence here establishes a time-zone bug or a single shared cause for those five.

## Desk process and scope

The desk started receiving these reports in April. A July merge spike is a desk action,
not the start of the defect or a fix. “Known” and “queued” do not mean fixed.
This issue concerns the provided 4 October export; the desk continues to work.

[Signed kb review source](https://github.com/Hexrays/mega-s01e03/blob/main/src/routes/kb/incidents/4471-review/+page.svx)
· [Rendered review](https://github.com/Hexrays/mega-s01e03/blob/main/rendered/4471-review.html)
