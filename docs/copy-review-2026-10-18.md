# Headroom copy review, 18 October 2026

## Delivery and baseline

The overhaul is split into reviewable stacked pull requests. Main has not been merged or released. Review and merge from the foundation upward.

| Order | Pull request | Scope |
| --- | --- | --- |
| 1 | [#3](https://github.com/harrydbarnes/Headroom/pull/3) | Encoding and shared foundations |
| 2 | [#4](https://github.com/harrydbarnes/Headroom/pull/4) | Settings |
| 3 | [#5](https://github.com/harrydbarnes/Headroom/pull/5) | Accounts and banking setup |
| 4 | [#6](https://github.com/harrydbarnes/Headroom/pull/6) | Activity, details, rules and month chooser |
| 5 | [#7](https://github.com/harrydbarnes/Headroom/pull/7) | Plan, actuals, debt and complete-month checks |
| 6 | [#8](https://github.com/harrydbarnes/Headroom/pull/8) | Move and scenarios |
| 7 | [#9](https://github.com/harrydbarnes/Headroom/pull/9) | Today and example guide |
| 8 | [#10](https://github.com/harrydbarnes/Headroom/pull/10) | Bills, budgets, pensions and account tools |
| 9 | [#11](https://github.com/harrydbarnes/Headroom/pull/11) | Recovery and app shell |
| 10 | [#12](https://github.com/harrydbarnes/Headroom/pull/12) | Services, error boundary and server copy |
| 11 | [#13](https://github.com/harrydbarnes/Headroom/pull/13) | Accessibility, native prompts, final lint and this review |

Baseline: `npm ci` passed; `npm run typecheck` passed; 17 test files and 206 tests passed. Each subsequent phase ran installation, typecheck and tests. Foundation through the services PR passed 216 tests; final lint and warning/formatting regressions expand that suite. The final verification receipt appears below.

## Change log by screen

The table records the principal before/after copy decisions. The screen-specific string modules contain the complete migrated copy; each PR isolates its screen diff. Existing long source lines were not reformatted wholesale.

| Screen/file | Old text or structure | New text or structure | Reason |
| --- | --- | --- | --- |
| Today.tsx | Standalone invalid middle-dot byte | Intended UTF-8 middle dot | Encoding |
| feature-parity implementation plan | Standalone invalid dash byte | Intended UTF-8 character | Encoding |
| Settings.tsx | Theme, wallpaper colours, motion and navigation | Colours and navigation | Length |
| Settings.tsx | Pair bank access; Pair this device | Link this phone | Consistency |
| Settings.tsx | Your workspace; personal figures | Your data | Jargon and consistency |
| Settings.tsx | SecureStore/SQLite/security-flag notes | Plain storage/privacy explanations, with complete limits in expandable detail | Jargon and length |
| Settings.tsx | Raw transaction/scenario counts in destructive dialogs | Named count helpers and two-sentence consequences | Plural and clarity |
| Settings.tsx | Retry native screen protection | Try protection again | Jargon |
| Accounts.tsx | Consent expired | Permission expired. Reconnect this bank. | Consistency and next step |
| Accounts.tsx | Incomplete retrieval; Failed, previous data retained | Some transactions may be missing; Refresh failed. Your earlier data is unchanged. | Error clarity |
| Accounts.tsx | Raw status values and locale timestamps with seconds | Readable status labels and shared London timestamps | Jargon and date format |
| BankingSetup.tsx | Long server/setup paragraphs | Short summaries with full details; owner sections labelled explicitly | Length and jargon |
| BankingSetup.tsx | Callback preview / redirect label | Server address (preview only) / Bank return address | Jargon |
| Activity.tsx | Accounting treatment; purchase; review | Type; Spending; Needs review | Consistency and enum labels |
| Activity.tsx | Raw dates in rows, transfer confirmation and month labels | UK dates, long spoken dates and named months | Date format and accessibility |
| Activity.tsx | Booking date in ISO | Typed UK date adapter, still passing ISO to the domain | Date input |
| RuleManager.tsx | Raw movement/direction and fixed plural verbs | Display labels and count summaries without singular/plural mismatches | Jargon and plural |
| TransactionDetails.tsx | Alias, annotations and long split notes | Display merchant name, plain split explanation and expandable detail | Jargon and length |
| MonthChooser.tsx | Raw month code | September 2026-style labels | Date format |
| Plan.tsx | Planned breathing room; undefined baseline | Monthly headroom and a defined monthly baseline | Consistency |
| Plan.tsx | Goal month in ISO | UK month input with existing stored format preserved | Date input |
| Plan.tsx | Long allocation explanation | Short summary plus all debt, goal, investment and risk caveats in detail | Length |
| CoverageEditor.tsx | Coverage/attestation language | Check this month is complete; Headroom cannot establish completeness for you | Jargon |
| CoverageEditor.tsx | Cash / unsupported spending | Cash and other accounts, display only | Consistency; stored sentinel preserved |
| ActualsEditor.tsx | Essentials now → proposed | Essentials: now and proposed | Clarity |
| Move.tsx | Mortgage at +2 points | Rate rises by 2 percentage points | Financial precision |
| Move.tsx | Raw historical-band dates and overlap counts | UK dates and singular/plural overlap periods | Date format and plural |
| Move.tsx | Long exchange/funding notes | Short summaries with full solicitor/lender and timing caveats | Length |
| Today.tsx | App-defined planning heuristic; margin | Plain score guide; headroom | Jargon |
| Today.tsx | Unformatted oldest-month and freshness dates | Named months and shared date/time display | Date format |
| Today.tsx / ExampleGuide.tsx | Personal/example figures and long lesson paragraphs | Your data / example data, with short lesson summaries | Consistency and length |
| BillTools.tsx | ISO schedule, renewal, price and refund fields | UK date adapters, optional fields and unchanged ISO values | Date input |
| BillTools.tsx | Snapshot wording and raw event statuses | Balances on recorded dates and display status labels | Jargon |
| BillTools.tsx | Date searches matched only ISO source text | UK typed/display date text is searchable alongside original ISO text | Date input compatibility |
| BudgetTools.tsx | Anchor payday / raw period dates | First payday / UK display dates | Jargon and date format |
| PensionTools.tsx | Long matching and limit paragraphs | Short summaries, full original caveats under Advanced pension limits | Length; financial meaning preserved |
| PensionTools.tsx | ISO effective dates and tax-year input | UK date inputs and 2026/27-style tax year | Date format |
| AccountLedger.tsx | Balance snapshot; ISO balance/export dates | Save balance; UK date fields | Jargon and date input |
| AccountLedger.tsx | CSV count plurals and raw account enum labels | Named count helpers and readable labels | Plural and consistency |
| Recovery.tsx | Recover your saved figures; validated archive language | Recover your data; checked backup and defined recovery records | Jargon and clarity |
| App.tsx | Figures covered; Opening saved figures | Screen hidden; Opening your data | Consistency and accessibility |
| components.tsx | Title + summary + Open section | Title, summary; separate Opens details hint | Accessibility |
| components.tsx | Long visible notes | Accessible HelpNote with expanded state and complete details | Length and accessibility |
| Native prompts | Default cancellation and no subtitle | Cancel label plus supported short subtitle | Accessibility and clarity |
| useBanking.ts / strings | Raw internal failures and bank messages | Known error translation and readable success/cancellation messages | Error clarity |
| Server pages | html lang=en; Authorisation cancelled | html lang=en-GB; Connection cancelled; clear return fallback | Accessibility and consistency |
| server/banking.ts | Home Move Planner fallback User-Agent | Headroom | Branding |
| app.json | No description | Plan your spending, review transactions and explore a house move. | Clarity |
| README and current onboarding guide | Old quoted UI actions | Current UI wording | Consistency |

## Decisions needed and proposed defaults

No unresolved decision requires changing a calculation or stored format. These conservative choices are recorded for review:

1. **Unknown write failures:** the brief’s proposed “Your data hasn’t been changed” fallback cannot be guaranteed after an asynchronous write. Keep “Something went wrong. Check the latest saved data and try again.” Known save failures retain their specific warning.
2. **DateField wrapper:** the existing `Field` accepts numeric amounts only. Wrap `Input`, retain the exact typed draft, validate on blur and block saves while invalid. Balance and export forms outside FormScope receive explicit validity callbacks.
3. **Date placeholders:** `DD/MM/YYYY` and `MM/YYYY` remain because they are explicitly requested. They are exceptions to the general prohibition on “YYYY” in display prose.
4. **Accessibility length:** transaction rows keep the complete natural sentence requested in the brief. They exceed the general eight-word label rule. Custom merchant, account, goal, scenario and bank names can also be longer than general UI limits; do not truncate or rewrite user data.
5. **Mortgage stress wording:** retain “2 percentage points”. “2%” could be understood as a relative increase and alter financial meaning.
6. **Sensitive pension limits:** retain the exact statutory-limit, MPAA, taper, carry-forward and defined-benefit caveats in Advanced pension limits. Simplifying their substance needs a separate financial wording decision.
7. **Legacy personal category (D5):** `Olivia & family` is exported by the legacy review calculator and used by its legacy validation. The current ledger imports only `parseCSV` and `dateValue` from that module; its UI does not render that exported category list. Keep the stored category unchanged. No migration is needed for this overhaul.
8. **CSV date explanation:** describe UK dates and accepted year-first bank exports without displaying a literal ISO date in ordinary UI prose. Existing CSV parsing still accepts both original formats.
9. **Device encryption wording:** retain the distinction between app-private data, device protection and no additional database encryption. Do not claim that all phone data is wholly unencrypted.
10. **External names:** bank-provided method names and user-entered names remain intact. Internal transaction types, period modes and account statuses use presentation labels.
11. **Historical documents:** current README/onboarding quotations are updated. Dated delivery evidence and implementation history remain historical, apart from the required encoding repair.
12. **Device verification:** no Android emulator, adb or connected phone is available. Keep the 360 dp and 130% font-scale screenshot check open; automated text checks do not prove layout or native accessibility behaviour.

## Deliberately unchanged

- Financial calculations, the 8% APR priority, thresholds, tax bands, pension rules, validation logic, API keys/status codes, persisted enums, backup formats and filenames.
- Name, slug, package, icons and extra.purpose. The Expo description is the only app.json change.
- Internal exception text asserted by domain tests. Error translation happens at UI boundaries.
- The legacy personal category and the stored cash-checklist sentinel.
- User-created account, merchant, category, goal and scenario names.
- All statutory and tax uncertainty, no-credit-score/lender-assessment limits, manual refresh, no-money-moved limits and the need for a human completeness check.
- Both existing GitHub Actions workflows.

## Verification receipt

- Final `npm ci`: passed; existing dependency patches verified.
- `npm run typecheck`: passed.
- `npm test`: 21 files, 223 tests passed. The original 206 domain tests remain green.
- `CI=1 EXPO_OFFLINE=1 npm run export:android`: passed; Android bundle exported successfully.
- `git diff --check`: passed.
- Package manifests, dependency lockfile and financial engine source are unchanged. app.json changes only the description.
- No emulator, device, font-scale, screenshot, live-bank or native accessibility verification is claimed. The 360 dp / 130% visual check remains open.

The checks verify presentation contracts and existing domain behaviour. They do not prove that every provider-supplied message, custom name or native dialog fits every device.

## Final glossary and style guide

# Headroom copy style

Use British English, sentence case and typographic apostrophes. Be direct, calm and specific. Buttons start with a verb and normally contain at most three words. Section titles normally contain at most four words. Visible helper summaries contain at most 25 words; preserve full caveats in HelpNote details. Dialogs describe consequences and recovery in at most two sentences. Use Close for panels, Dismiss for messages and Cancel for dialogs.

| Concept | Preferred text |
| --- | --- |
| Personal information on the phone | your data |
| Fictional demonstration | example data |
| Incoming/outgoing money | Money in / Money out |
| Transaction classification | Type: Spending, Income, Refund, Transfer, Repayment, Needs review |
| Phone/server setup | Link this phone |
| Bank access | Connect a bank; bank permission |
| Fetching transactions | Refresh transactions |
| Completeness | Check this month is complete |
| Unlinked accounts | Cash and other accounts |
| Monthly remainder | monthly headroom: what’s left after planned spending |
| Confirmed income/spending | monthly baseline: your confirmed monthly income and spending |

Display calendar dates as 18 Oct 2026, details as 18 October 2026, months as September 2026, tax years as 2026/27 and instants as 18 Oct 2026, 14:30. Typed dates use DD/MM/YYYY, months MM/YYYY. Keep ISO in storage, APIs, exports and filenames. Calendar dates use UTC parts; instants display in Europe/London.

Do not use long dashes, double hyphens, internal enum values or technical storage terms in ordinary UI copy. Middle dots are visual list separators only; use commas for accessibility labels. Technical terms belong in defined Advanced/owner sections. Keep financial/tax meaning, thresholds and uncertainty intact. Never promise data was unchanged when the write outcome is unknown.

Copy lint scans the migrated string modules and UI call sites. It checks jargon, UK spelling, ISO display examples, dashes, fixed button wording, helper length, alert organisation and shared date display. Internal error keys, explicit date placeholders, custom user/bank names and native status/navigation labels are documented exceptions. Transaction accessibility sentences retain the complete detail requested in the brief, even though they exceed the general eight-word label rule.

Financial stress labels use “2 percentage points” to avoid confusing an absolute rate increase with a relative 2% change. Technical pension-limit wording stays intact inside Advanced pension limits details. Unknown errors direct users to check the latest saved data; they do not promise that an asynchronous write left data unchanged.
