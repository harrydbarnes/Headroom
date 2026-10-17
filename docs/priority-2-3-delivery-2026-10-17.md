# Period budgets, bills and manual pension matching

17 October 2026. This implements priorities 2 and 3 plus the exact roadmap row “Alongside 2–3: Manual pension contributions and employer-match calculator”. Existing monthly planning and Move remain independent. No bank connection, payroll election, payment or cancellation is executed by these tools.

## Where to use it

- Plan → Period budgets: set an anchored weekly, fortnightly, four-weekly, monthly or yearly calendar; choose weekend handling; add overall/category/source-merchant limits. Custom categories and one level of subcategories map to Essentials, Flexible or Annual bills. Archive/reopen preserves their names and history. Activity offers active custom categories.
- Plan → Pension contributions: add each employer/scheme version, pensionable-pay denominator, election and confirmed employer terms. Compare the current election, full matching, a chosen rate and, when safeguards are supplied, a rate constrained by a headroom floor. The Today card appears only for an effective, confirmed matching opportunity.
- Plan or Activity → Bills and cash flow: review recurring suggestions, confirm schedules, record dated price changes, renewal/cancellation notes and expected refunds, link booked settlements, and inspect a dated forecast. Forecast to next expected income uses a confirmed incoming schedule on a selected account.

Forms are drafts until saved, except the explicitly labelled forecast assumptions, which save as edited. New forms and pension form sections reset their scroll/focus container. All monetary output uses existing privacy-aware Money controls. Review the existing save-status indicator before closing the app.

## Budget rules

Budgets use included accounts and reviewed purchases/refunds. Category splits replace the parent's category allocation; their total is never added again to the parent. Reimbursements should be reviewed as refunds in the expense category, not salary. Transfers, income and repayments do not consume spending budgets. Overall/category/merchant limits overlap; their remaining values must not be summed.

Month-end anchors clamp without drifting after February, including leap years. Weekend adjustments can cross a month boundary. Changing the default calendar freezes existing budgets to their previous calendar; new budgets use the new one. A mid-period start receives a full allocation from that date. End a dated limit and add its replacement to change an amount without rewriting its old allocation history.

Positive rollover carries only unused amounts; both also carries overspending. Completed-period snapshots can be recorded, retained and compared with recalculation after a late correction. Daily allowance divides positive remaining budget by days remaining including today. It is a budget rate, not a safe-to-spend claim. Three covered, fully reviewed past months are required for suggested allocations; suggestions require explicit review and acceptance. Coverage remains the user's attestation.

## Pension proof boundaries

The engine supports defined-contribution fixed employer amounts, base percentages, marginal matching tiers (including enhanced matching), caps and genuine additional employer funding. Sacrificed salary stays separate from the employer's genuine benefit even if the provider calls both employer contributions. DB/hybrid records are retained, with DC matching scenarios withheld.

The fictional acceptance example uses £4,000 pensionable pay, 4% employee election and one-for-one matching up to 6%: current employee/employer £160/£160 versus £240/£240, with £80 extra genuine employer funding and £1,920 extra total funding/year. These figures are fixtures, not Harry's scheme terms.

The chosen contribution basis and supplied pay-period denominator are explicit. Qualifying earnings must be confirmed from scheme/payroll evidence; no generic statutory minimum is invented as an employer's matching policy. Observed gross funding rates and manual YTD records remain distinct from projected monthly/annual run rates. A one-off gross contribution is counted once in the annual illustration.

This slice does **not** implement a statutory payroll-tax/NI/allowance engine or document extraction. Net-pay impact uses a user-supplied payroll-confirmed incremental cost factor, within the supplied comparison range, for supported tax years 2025–26/2026–27. Scottish and rest-of-UK jurisdiction are recorded; neither silently uses the other's tax bands. Unknown method, unsupported year or missing factor withholds net-pay estimates. Relief at source distinguishes gross funding from the basic relief component. Future tax rules are not silently applied.

A highest modelled rate additionally requires a confirmed household baseline, independently verified ceiling, all-scheme earnings/allowance checks and salary-sacrifice minimum-pay confirmation when applicable. It is not a statutory maximum. MPAA, taper, carry-forward, DB input, other schemes, benefit interactions and reference-pay effects require independent verification. Compare schemes individually; do not add separately illustrated headroom results together. Existing pension deductions already reduce take-home income; only an incremental change is compared with household headroom.

Guidance checked during implementation: [scheme-dependent contribution bases](https://www.gov.uk/workplace-pensions/what-you-your-employer-and-the-government-pay), [all-scheme annual allowance](https://www.gov.uk/tax-on-your-private-pension/annual-allowance), [contribution methods and tax relief](https://www.moneyhelper.org.uk/en/pensions-and-retirement/tax-and-pensions/tax-relief-and-your-pension). Those pages explain the distinctions; they do not validate an individual employer's terms.

## Bills and forecast rules

Suggestions require at least three reviewed entries with consistent intervals. They show frequency, observed amount range, next-date proposal and evidence count. Suggestions never become commitments automatically. Monthly/yearly schedules handle short months; variable payments use the confirmed estimate. Dated prices retain the original amount. An end date stops future occurrences; a renewal date or cancellation instruction is a local reminder, not a cancellation service.

An exact merchant/account/amount match within three days can settle one booked occurrence, including a booked entry still awaiting category review. Ambiguous matches remain unresolved. Review booked match lets you reject a mistaken match; that per-occurrence exclusion survives backup/restore and an explicit correction can override it. Explicit links cannot reuse a transaction for another expected event. Changed/missing links remain visible for review. Pending transactions are unsupported by the existing provider path and are not fabricated.

Forecasts use selected spendable current/cash/savings snapshots; liabilities and unavailable/future snapshots do not become cash. Booked deltas after each snapshot date are applied once; same-day activity is assumed included in that snapshot. Source dates, excluded accounts, latest import status and uncertainty are visible. Overdue outgoing bills are held conservatively; overdue income is not credited. Expected refunds never raise the modelled spendable balance until a booked receipt exists. Annual-bill, goal and proposed-pension reserves are one-time holds, with an explicit warning against double reserving them.

This is an explainable planning estimate, not an account-reconciled safe-to-spend number. Unrecorded spending, pending items and unsupported/excluded accounts can be missing. Notifications and automated background refresh remain later priorities.

## Persistence and verification

Workspace planning records use the existing validated SQLite/save/recovery boundary. Storage version 5 accepts versions 3/4 and atomically retains a pre-planning version-4 snapshot before its first upgrade write. A failed write commits neither the archive nor the new state. Backup version 4 retains budgets, closes, categories, schemes, schedules, settlements and refunds; versions 2/3 still import. Older app versions reject the new format rather than silently dropping these fields. Export a backup before upgrading if rollback is needed.

206 tests across 17 files and TypeScript checking pass. Tests cover calendar boundaries, split conservation, rollover and corrections, original-calendar retention, matching/unknown/DB/sacrifice scenarios, future-year withholding, recurring suggestions, settlement deduplication, missing balances, refund/overdue handling, backup roundtrips and SQLite rollback/reopen. The original full parallel test run hit the existing five-second server startup timeout; that server suite passed independently and the full suite passed with four workers.

Local Android release builds pass. CI validation and a clean Linux APK build are being recorded against the final code revision. The phone was not connected for this implementation pass: new native forms, large text, TalkBack and on-device restore remain unverified until a fresh physical pass. The earlier priority-0/1 device results do not certify these new screens. Live bank verification remains open from priority 0/1 and does not block manual use.
