# Headroom P2 implementation — 0.2.2

Implemented 15 October 2026 in the existing working tree. This covers the P2 daily-workflow batch following P1. It is source/test/build evidence; the native and live-service acceptance gates below remain open.

## Before and after

| Area | Before | After |
| --- | --- | --- |
| Plan | Long live-edit form; unrelated changes shared a page | Focused section rows open draft editors. Apply validates the section; closing discards drafts. Only changed values are applied. Baseline confirmation is separate from editing. |
| Settings | Appearance, privacy, pairing and data actions required a long scroll | Grouped rows open focused sheets, with native focus-return callbacks. Data removal shows affected record counts and distinguishes local data, pairing and bank consent. |
| Setup | Unknown and skipped sections were indistinguishable from zero | Explicit skip choices and a persistent remaining-checks list. Visiting the overview or confirming a baseline does not silently clear skipped checks. |
| Today | Current-month review only; aggregate spending used a different category scope from the baseline | Oldest-backlog action opens that month with review filters. Expired verified consent routes to Accounts. Income/commitment breakdown, score evidence/component explanations and a category-aligned monthly comparison show exclusions. |
| Activity | Repeated month taps; filters and coverage crowded the list | Month chooser with outstanding counts and oldest jump; focused filter controls, treatment filtering and clear filters; coverage/ranges have a separate view. Actuals selection also uses the month chooser. |
| Coverage | One undifferentiated month attestation | Per-account complete / missing / no-activity checklist, including cash/unsupported spending and accounts without imported rows. All entries and an all-account attestation are required for a new confirmation. No-activity cannot be selected for an account with rows in that month. Legacy attestations remain identifiable by their missing checklist. |
| Transfers and rules | Informational pair suggestion; merchant rules could not be edited | Explicit two-sided preview and confirmation, with fresh uniqueness/sign/date/account checks and undo. Direction-specific merchant rules, editing and a matching-entry preview preserve existing classifications. |
| Annual bills | Yearly input was repeatedly reconstructed from rounded monthly pence | Original annual pence are retained; the monthly reserve is derived and consistency-checked. Editing the monthly source explicitly clears the annual source. |
| Debts and goals | Combined pools; goal month counts stayed fixed | Optional reference minimum payments already included in essentials; APR-ordered extra repayment preview. Goals have fixed target months, priorities, pause/resume funding and individual allocations/shortfalls. Emergency cash shows held/target/gap progress. |
| Accounts and sync | Ephemeral import warnings; reconnect required rediscovery | Validated persistent attempt receipts, local completion versus provider retrieval timestamps, bank-specific reconnect and retry, partial warnings retained in cached results, plus virtualised bank search results. Consent return reports a new connection only after verified status shows it. |
| Move | Detailed sample property amounts in new personal workspaces; one advanced block; immediate scenario deletion | Blank personal property/fee amounts, deliberate labelled template and input-origin labels. Buyer/tax, sale, fees, borrowing and exchange open focused sections. Main constraint leads, with costs behind a breakdown action. Saved scenarios can be selected for adaptive comparison/differences, renamed, updated, loaded or deleted with undo. |
| Receipts and components | Informational/success messages shared warning styling | Info/success/warning/error variants and shared section rows reduce repeated card framing. Screen titles identify the current destination. |

## Data and calculation details

- Existing goal month counts convert to a fixed month using the last baseline-confirmation month, or the migration month if no baseline timestamp exists. SQLite commits this migration before returning it; restoring an older backup anchors its dates too. Review migrated deadlines in Plan. Goal amounts and savings are preserved.
- Goal funding is ordered by ascending priority; ties use stable goal identity. Expensive debt and emergency cash retain their existing precedence. Due or overdue goals use one month for the required-contribution calculation; paused goals retain their records and savings.
- Debt minimums are reference amounts, already included in essentials; they are never subtracted again. Baseline confirmation is blocked if recorded minimums alone exceed essentials. Extra payments are allocated by descending APR, within the existing high-cost-debt pool.
- New metadata stays within the validated version-2 public backup envelope and version-3 SQLite metadata layout. Tokens and banking secrets remain excluded from backups. Malformed receipts or goal metadata are rejected before changing live data.
- Transaction imports and their successful/partial receipt are one validated workspace mutation. A failed attempt records an error receipt while retaining prior transactions and the last complete all-bank import time. A retry of one bank does not advance that all-bank timestamp. Receipts describe the banks requested by that attempt; connection cards show each bank's provider retrieval time.
- Reconnect creates fresh consent without first revoking the old consent. Verify the new connection, then disconnect superseded expired consent. This avoids deleting working access before authorisation completes; the app does not silently revoke another connection.
- Scenario deletion undo is available until the scenario list changes. Transaction review undo remains independent. Loading/updating scenarios requires explicit confirmation.
- Coverage remains user attestation. Transaction date ranges, completed checkboxes and this app-defined score do not establish independent financial evidence. Earlier month confirmations are preserved and can be upgraded by opening their checklist.

## Verification

- TypeScript: passed.
- Vitest: **130 tests passed in 11 files**, including dated goals/migration, allocation conservation and priority, annual precision, minimum-payment accounting, transfer ambiguity/staleness, direction rules, receipt/backup roundtrips, atomic mutation rejection and targeted bank refresh.
- Android Hermes export: passed; 733 modules, 2.3 MB bytecode and one icon font. This is not an installable APK or native runtime test.
- Git whitespace validation: passed.
- ADB inventory: no connected phone or emulator.

## Open acceptance checks and next batch

1. On a Pixel/emulator: inspect actual light/dark/wallpaper colours, compact/landscape/large-text layouts, keyboard entry, modal focus/scroll continuity, virtualised lists and scenario comparison. Responsive comparison uses columns on wider layouts and stacked figures on phones; native appearance is unverified.
2. Verify app lock and screenshot/app-switcher protection, including background/resume and failure recovery. These P1 release gates remain open.
3. Against the configured HTTPS banking service: complete/cancel consent, reconnect and remove old consent, retry one failed bank, verify cache/rate-limit behaviour and relaunch with partial warnings retained.
4. P1's unresolved build-tool dependency advisories remain tracked in its handover; P2 did not change the dependency tree or establish an audit-clean release.
5. Next code batch: P3 motion tokens/interruption handling, final typography/component polish, richer example walkthrough/reset and remaining responsive refinements. Use real phone screenshots to guide that polish.

No commit, push, deployment, APK installation or real-bank operation was performed.
