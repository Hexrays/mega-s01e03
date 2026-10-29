## Problem

booking-v3 displays MM/DD/YYYY under its date field for day-first tenants,
but the form interprets the input in the tenant's day-first order.
A user who follows the hint can book the wrong date. This is not the shared month-first
parser defect; changing only that parser does not correct the hint.

## Reports covered: 33

33 unique reports were wrongly merged into ticket #4471.
Received 2026-04-17 through 2026-09-22, across three booking-v3 tenants:

- Alder Physio (alder.physio, de-DE)
- Copper Studio (copper.studio, es-ES)
- Pale Harbour (pale.harbour, pt-PT)

All affected reports use the form channel.
Membership: [hint-reports.json](https://github.com/Hexrays/mega-s01e03/blob/main/analysis/hint-reports.json).
Intake guessed hint for 18 and parser for 15. Those browser-based guesses are not the cause.
The 33 reports are separate from the 379 assigned to the shared parser. The total is 412.

## Evidence and conditions

- R-41230, Copper Studio, form, booking-v3: intended 6 January, client came on 1 June.
  Intake tagged it parser, but tenant/form/channel classification assigns hint.
- R-41241, Alder Physio, form: booked for 6 August, people arrived on 8 June.
- R-41251, Pale Harbour, form: 7 January showed as 1 July.

The condition in `src/lib/kb/causes.ts` is a day-first tenant using the form channel with
a booking-v3 hint that starts with MM. Tenant settings come from `locales.ts` and the
tenant directory, not browser locale. A form report from booking-v2 still goes to parser.
The provided classifier and rendered table demonstrate the split; no runnable product form
was provided, so this is not a claim of a production reproduction.

## Required fix and checks

Make the displayed date hint agree with the form's parser for the tenant's locale.
Test that a user who follows the displayed format gets the intended date in the booking
and invite. Test all three affected tenants, booking-v2 regression cases, other channels,
and browser locale different from tenant locale. Test both ambiguous and unambiguous dates.

## Desk process and scope

The original page said “one issue, one fix queued,” but its rendered table exposes this
second cause without its own ticket. Subject-only merging hid it.
Use the revised cause-based triage rule and preserve the accepted historical decision 0001.
This issue concerns the provided 4 October export, not the live desk or a verified fix.

[Signed kb review source](https://github.com/Hexrays/mega-s01e03/blob/main/src/routes/kb/incidents/4471-review/+page.svx)
· [Rendered review](https://github.com/Hexrays/mega-s01e03/blob/main/rendered/4471-review.html)
