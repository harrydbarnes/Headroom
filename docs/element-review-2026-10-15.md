# Headroom: element review and priority updates

Reviewed 15 October 2026 against the current working tree, including the 0.2 implementation. This is a source-based product and implementation review. A current ADB check returned no connected devices. No rendered screenshots, screen-reader session, native privacy test or live consent flow was captured. Visual and native findings below describe risks and proposed changes, not observed device failures.

Priority definitions: **P1** = address before relying on or releasing the affected feature; **P2** = next usability/product iteration; **P3** = refinement after those issues are resolved. No P0 blocker was established by this review.

P1 source changes were subsequently implemented in 0.2.1. See [before/after, verification and open release checks](p1-completion-2026-10-15.md). Findings below describe the reviewed pre-fix state.

P2 daily-workflow changes were subsequently implemented in 0.2.2. See [P2 before/after and remaining verification](p2-completion-2026-10-15.md). Native visual/accessibility and live-bank acceptance checks remain open.

P3 source refinements were subsequently implemented in 0.2.3. See [P3 before/after and device acceptance matrix](p3-completion-2026-10-15.md). Visual and native release claims still require hardware/emulator evidence.

## What is worth keeping

The product has a clear central concept: monthly breathing room. Personal/example isolation, explicit planning versus actuals, preserved classifications on imports, editable move assumptions, optional Move navigation, visible limitations and restrained motion are useful foundations. Keep those decisions while improving the issues below.

## First fixes

### P1 — Use one debt model throughout setup and planning

Restarted onboarding edits `plan.debt` and `plan.debtApr`, while the calculator prefers `plan.debts` once named debts exist. That means a user can change a debt amount in setup without changing the calculated debt or repayment allocation.

Reproduced with the actual calculator: a named £500 debt remained £500 with the same extra repayment after the legacy setup fields were set to zero. Replace the dual live models with named debts everywhere; use the old scalar fields only in migration. Setup should either edit that list or route to the existing debt editor.

Evidence: `src/screens/Today.tsx:14`, `src/screens/Plan.tsx:9`, `src/lib/finance.ts:15`.

Acceptance: editing debt in any supported flow changes the same list, total and allocation; restarting onboarding cannot introduce an ignored value.

### P1 — Prevent the app saving data it refuses to reopen

Merchant rules can grow without a runtime cap, but workspace loading rejects more than 1,000 rules. A large remembered batch or accumulated rules can therefore produce a saved workspace that startup rejects. The exporter checks serialized size but does not validate the workspace first, so it can also export a file the restore path rejects.

Reproduced: a workspace with 1,001 valid rules exported successfully, while `validateWorkspace` rejected it with “Invalid backup list.” The mutation path does not enforce that list limit. Similar policies need consistent handling for transaction and scenario limits. Also check duplicate debt/goal/scenario identities during restore, not only transaction identities.

Evidence: `src/state/store.ts:33`, `src/lib/workspace.ts:41`, `src/lib/workspace.ts:60`, `src/lib/workspace.ts:63`.

Acceptance: every persisted state can be reopened and every exported backup can be restored. Reject an over-limit edit before changing the live workspace, with a useful message; do not discard existing records to fit a limit.

### P1 — Add correction and deletion for manual transactions

Manual entries can be created, but the transaction detail sheet only changes treatment and category. There is no flow for fixing a wrong amount, date, merchant or account, or removing an accidental duplicate. This leaves users with incorrect totals and no targeted recovery action.

Evidence: `src/screens/Activity.tsx:34` and `src/screens/Activity.tsx:43`.

Acceptance: manual entries have Edit and Delete, with undo and affected-month reconfirmation. Provider-owned amounts should retain their source value; any local annotation or override must be explicit and survive reimport predictably.

### P1 — Make “use actuals” a reviewed budget change

The baseline update includes only transactions categorised Essentials and Flexible. Month coverage confirms the presence/review of spending, not that every relevant purchase has been categorised into those two groups. A confirmed month can still contain Other, Uncategorised or Annual bills transactions. Applying those partial category totals can reduce the baseline incorrectly.

Evidence: `src/screens/Plan.tsx:12`, `src/screens/Plan.tsx:20`.

Acceptance: show old/new amounts, included and excluded categories, excluded transaction counts and annual-bill treatment. Let the user choose the source month and reject or explicitly resolve uncategorised spending before applying a proposed baseline.

### P1 — Model the current housing cost being replaced

Post-move headroom subtracts the proposed payment and adds back only the current mortgage. The Move screen now exposes first-time-buyer/no-sale scenarios, but a renter's current rent is not represented as the housing cost to replace. If rent is in essentials and the current mortgage is zero, the comparison retains rent and adds the new mortgage.

Evidence: `src/lib/workspace.ts:32`, `src/screens/Move.tsx:16`, `src/screens/Move.tsx:22`.

Acceptance: capture current housing payment and whether it stops after the move, separately from mortgage redemption. Test homeowner, renter, no-current-payment and overlapping-payment cases.

### P1 — Make saved and protected states reflect actual completion

Review feedback says “Review saved” before the SQLite write completes; restore feedback similarly declares restoration before persistence acknowledgment. The screenshot switch represents the requested preference even when applying native screen protection fails. These should be distinct pending/applied/failed states.

Evidence: `App.tsx:32`, `App.tsx:68`, `src/state/store.ts:15`, `src/screens/Settings.tsx:17`.

Acceptance: acknowledge durable saving only after the write succeeds. Show failed screen protection beside its switch; verify startup protection and app-switcher behaviour on a phone before treating the privacy feature as ready.

## Element-by-element recommendations

| Element | Assessment | Priority update | Priority |
| --- | --- | --- | --- |
| Launch/loading | Initialization protects unreadable saved data, but recovery choices are limited | Add a clear recovery screen with restore, retry and safe export of recoverable data; do not present default figures as recovered data | P1 |
| First-run progression | Four steps exist; zero, unknown and skipped values share the same representation | Add explicit Not known yet / Skip choices and a remaining-setup checklist | P2 |
| Setup debt input | Uses a different live model from named debts | Unify it with Plan debts as described above | P1 |
| Setup completion | User can finish without a confirmed baseline; subsequent messages explain that | Use a final review summary with entered/skipped sections and one clear next action | P2 |
| Example mode | Personal figures are isolated and clearly labelled | Keep the isolation; offer a reset-to-original example action and sample past-month evidence to demonstrate the full review journey | P3 |
| Header and navigation | Labelled destinations and optional Move are useful | Add screen-specific titles and verify narrow-width/large-text tab layout; preserve sensible Android back and keyboard behaviour | P2 |
| Today headroom hero | Central figure distinguishes planning from a balance | Show a compact income → commitments → remaining breakdown with an explanation action | P2 |
| Today next action | Only current-month unreviewed items drive the review prompt | Include older review backlog, expired consent and missing setup; make the action open the relevant month/task | P2 |
| Today freshness | Last complete import is recorded when a successful/cached refresh is handled | Separate last attempt, local import time and actual provider retrieval time; expose account-level freshness | P2 |
| Wellbeing score | Guarded by baseline and user-confirmed evidence | Keep it secondary; show component explanations and a checklist of missing evidence, without implying external validation | P2 |
| Monthly check-in | Shows reviewed total against essentials + flexible | Reconcile category scope, particularly annual-bill transactions, and label partial totals clearly | P2 |
| Activity month selector | Previous/next works but requires repeated taps for old history | Add a month chooser with review counts and a jump to the oldest outstanding month | P2 |
| Activity filters | Merchant/account/category filtering exists | Add money-in/out and treatment filters, a Clear filters action and compact filter controls | P2 |
| Activity list hierarchy | Many controls precede the first transaction in source order | Put review count and the list first; move detailed coverage/ranges into a separate view | P2 |
| Bulk review | Applies one decision to every filtered row; no subset selection | Add multi-select, a selected count, visible summary and direction filtering. Mixed debit/credit selections otherwise disable useful treatments | P1 |
| Transaction details | Treatment and category can be changed independently | Suggest compatible categories and warn about contradictory combinations; keep debit/credit wording consistent between row and sheet | P2 |
| Manual transactions | Creation exists, correction does not | Add edit/delete/undo and duplicate warnings | P1 |
| Transfer suggestions | Conservative amount/date match; both sides still need manual review | Add an explicit two-sided confirmation action with preview, keeping ambiguous candidates unresolved | P2 |
| Merchant rules | Exact-match future rules preserve prior review | Enforce reload-safe limits first; then add editing, previews and distinct debit/credit rules for the same merchant | P1 / P2 |
| Month coverage | Explicit attestation is more honest than date-range inference | Introduce an account/month checklist, distinguish No activity from Missing data, and keep confirmation away from the long transaction footer | P2 |
| Baseline editor | Live validation exists, but it is one long form with confirmation near the top | Use section summaries with edit sheets and a persistent review-changes action; show which values require reconfirmation | P2 |
| Numeric input | Each valid partial edit updates the live plan | Prefer section drafts or coalesced autosave; make error recovery and the saved value explicit. Verify currency entry with the native keyboard | P2 |
| Annual-bill helper | Converting each edit to monthly pence can lose yearly precision | Retain the entered annual amount as the source value, displaying the derived monthly contribution | P2 |
| Emergency cash | Simple amount and target are understandable | Distinguish cash held from target and show progress; keep goal savings separate | P2 |
| Named debts | Individual balances/APRs exist | Unify setup first; then add optional minimum payment and repayment order, avoiding double counting in essentials | P1 / P2 |
| Named goals | Target/saved/months are recorded, but “months until needed” does not advance by itself | Store a target date, derive remaining time and allow explicit goal priority and funding choices | P2 |
| Allocation summary | Combined goal pool and debt allocation are transparent | Add per-debt and per-goal previews so the user can see how the pool could be divided | P2 |
| Investment assumptions | Appropriately optional and illustrative | Keep them collapsed; explain unmet prerequisites next to the zero allocation | P3 |
| Actuals-to-plan update | A subset of categories can replace the baseline | Add reconciliation and a before/after preview as described above | P1 |
| Move initial state | New personal workspaces inherit detailed property and mortgage defaults | Use empty personal inputs or a deliberate labelled template; give existing migrated figures provenance | P2 |
| Move housing comparison | Mortgage-only replacement does not represent renters | Add explicit current-housing-cost and overlap assumptions | P1 |
| Move fees and tax | Editable but many unrelated controls share one advanced expansion | Split buyer/tax, sale, fees, borrowing and timing into labelled sections; show assumptions used with results | P2 |
| Move results | Borrowing, completion cash and exchange timing are separate | Keep that distinction; lead with the main constraint and let users open the detailed cost breakdown | P2 |
| Move scenarios | Saved snapshots are listed vertically, with immediate removal | Add side-by-side/difference comparison, rename/update actions and delete undo | P2 |
| Accounts status | Stored pairing and status calls exist; stale and absent state are insufficiently distinct | Use explicit Loading / Unpaired / Unavailable / Verified states and a last-checked time | P1 |
| Consent/reconnect | Expired consent is labelled; reconnect requires bank discovery again | Add a direct bank-specific reconnect action and a clear success/cancelled/unfinished return result | P2 |
| Sync feedback | Partial outcomes exist but are transient and use global messages | Persist the last attempt summary, retain partial warnings through app resume, and offer retry for failed banks | P2 |
| Bank search | Search exists; matches are rendered as many full-width buttons | Use a virtualised bank list with supported-method/account information and a clear empty result | P2 |
| Pairing | One-use tickets reduce repeated token handling | Keep personal-server setup under Advanced/help; add copy/paste guidance and actionable expiry feedback | P2 |
| Appearance | System/light/dark and optional wallpaper palette are implemented | Verify actual palette contrast, selected/disabled states and readable layouts before adding more theme options | P2 |
| Settings organisation | Appearance, privacy, backups, pairing, workspace, rules and About form one long page | Use grouped settings rows opening focused pages/sheets; keep destructive actions in a clearly separated data-management area | P2 |
| Authentication | Device authentication gate exists | Check enrolled biometrics, fallback, cancellation, background/resume and recovery on the actual Android target | P1 verification |
| Screenshot protection | Requested preference can remain enabled after application failure | Add pending/applied/failed state and check protection before sensitive content is shown | P1 |
| Hide amounts | Summary values are masked; form fields remain visible with an explanation | Retain honest scope; add a quick temporary privacy action if users need to hide the whole screen | P3 |
| Backups | Validated JSON with explicit replacement is a useful start | Enforce write/load/export consistency, byte-based size checks and a before/after restore summary; consider optional encrypted exports later | P1 / P2 |
| Delete/disconnect/unpair | Scopes are explained separately | Keep those distinctions; add a consolidated data-removal guide and counts of what will be removed | P2 |
| Errors and receipts | Global messages are visible, but success and informational messages use the warning-style Notice | Add success/info/warning/error variants, local actionable errors and durable completion feedback | P2 |
| Save performance | Each valid edit clones the active workspace and serializes both workspaces into a queued whole-state SQLite write | Coalesce writes, use narrow store subscriptions and separate transaction records from small plan/preferences updates | P1 before larger histories |
| Typography and components | Shared styles exist, but rounded cards/buttons dominate all sections | Add consistent display/headline/title/body/label roles, list rows, dividers and component variants; reduce identical card framing | P2 |
| Motion | Springs and reduced-motion support exist, with some values embedded in components | Centralise motion tokens, stop interrupted transitions and verify focus/scroll continuity. Prioritise clarity over more effects | P3 |
| Accessibility | Roles and input labels exist, but row labels omit transaction amount/direction; sheets have no explicit focus restoration | Include safe amount/direction labels when unmasked, associate field errors, manage modal focus and verify TalkBack/large text/keyboard | P1 |
| Adaptive layout | A rail appears at a fixed width, while content remains mostly a single column | Test compact/landscape/tablet widths; use summary-plus-editor or list/detail layouts where space supports it | P2 |
| Native validation and dependencies | Existing source tests/bundle proof do not cover device interactions; dependency advisories were recorded previously | Run the device acceptance matrix and triage advisories against the actual dependency tree before release | P1 verification |

## Recommended delivery order

1. **Correctness and recovery:** unify debt data; enforce persistence/export invariants; enable manual transaction correction; reconcile actuals before applying them; fix housing-cost replacement; make saving/protection states honest.
2. **Daily workflow:** selective bulk review and direction filters; backlog-aware next actions; persistent sync receipts; focused Plan and Settings editors; goal dates and clearer scenario comparisons.
3. **Design and release validation:** refine component/type hierarchy, error variants, adaptive layout and motion; verify the full flow with real screenshots, native accessibility, privacy controls and live consent.

Accessibility and native verification are release requirements alongside the first batch, rather than work to defer until all visual refinement is complete.

## Evidence checks performed in this review

- Read all current screens, shared components/theme, app shell, workspace validation, persistence and banking service state.
- Confirmed no Android device/emulator was attached.
- Ran two read-only executions of the current pure functions: the ignored onboarding debt edit and export/reload rule-limit inconsistency described above. No application code was changed and no new tests were added.
- The earlier 86 passing tests and Android export are recorded implementation checks, not newly executed device evidence for this review.

Design references checked: [Material motion schemes](https://m3.material.io/styles/motion) and [Material typography roles](https://m3.material.io/styles/typography/applying-type). Standard motion is a suitable starting point for this utilitarian finance workflow. Accessibility review should follow [React Native accessibility guidance](https://reactnative.dev/docs/accessibility), then be verified with the device's actual assistive technology.
