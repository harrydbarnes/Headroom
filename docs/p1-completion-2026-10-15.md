# P1 implementation closeout — Headroom 0.2.1

15 October 2026. This closes the implementable P1 source findings in the [element review](element-review-2026-10-15.md). Device-dependent acceptance checks and the remaining upstream advisory reports are explicitly open below; this is not an installed-app or production-release sign-off.

## Before and after

| P1 area | Before | After |
| --- | --- | --- |
| Debt consistency | Restarting onboarding could edit scalar debt fields that named-debt calculations ignored | Setup and Plan use the same named-debt editor. Legacy scalar values are converted when loading older data; mutation actions reject new scalar debt/goal writes |
| Save/load/export invariants | More rules could be saved than startup would accept; exports did not validate the complete workspace | Every workspace mutation validates before replacing live data. Counts, byte-based size limits and identities are checked consistently; export validates too. Immutable live data prevents rejected callbacks from mutating existing records |
| Manual corrections | Wrong manual amounts, dates or accounts could not be fixed or individually removed | Edit and Delete are available for manual entries, with duplicate warnings and undo. Edits return to review and invalidate affected months. Imported source details remain read-only |
| Bulk review | One action selected every filtered transaction with no subset selection | Individual checkboxes, select/clear matching, selected counts and a summary precede application. Money-in/out filters support compatible treatment groups. Direction mismatches are also rejected by the store |
| Actuals-to-plan | A partial category total could replace the budget after a generic confirmation | A chosen past month produces an old/new preview, included/excluded counts and explicit Other/annual-bill exclusions. Missing coverage, unreviewed or uncategorised spending, negative net categories and stale previews block application |
| Housing replacement | Only the old mortgage was added back, leaving rent in a first-time buyer's budget | Current rent, mortgage or no payment are explicit. Continuing payments remain; stopping payments are replaced. Overlap months have a separate budget. Redemption stays a distinct sale balance |
| Durable receipts | Review/restore could be labelled saved before SQLite completed | Review receipts distinguish saving, saved and failed. Restore awaits a successful commit before declaring success. Retry preserves in-memory edits after a failed write |
| Storage efficiency | Each valid keystroke cloned and queued a full JSON rewrite of both workspaces and all transactions | Small edits are validated without cloning transaction history, saves coalesce over 180 ms and flush on backgrounding. Transactions live in a separate table; metadata edits do not rewrite history. History updates write only changed rows inside the same atomic transaction as metadata |
| Launch recovery | Corrupt data paused writes but offered no dedicated recovery workflow | The app shows Recovery rather than default financial figures. Users can retry, export a validated recoverable personal workspace, preserve a raw recovery archive or restore an approved backup |
| Screen protection | A requested preference could look enabled after native application failed | Requested and applied state are separate. Pending/failed requested protection keeps financial screens hidden. Retry and explicit turn-off are available; failed disable retains the last confirmed applied state |
| Bank status | Failed checks could leave absent or stale accounts insufficiently distinguished | Loading, Unpaired, Unavailable and Verified are explicit. Last verification and error remain visible. Re-pairing to another server clears unrelated old details, malformed responses cannot become verified, and late responses cannot undo unpairing |
| Accessibility | Transaction labels omitted amounts/direction; form errors and sheet focus lacked explicit handling | Unmasked labels include amount/direction; masked labels say amount hidden. Field errors are announced and attached through hints/labels. Sheets focus their heading and restore focus to the relevant row or review heading. Native TalkBack verification remains required |
| Dependency triage | npm reported 26 advisory package entries: 2 critical, 15 high, 9 moderate | Vitest upgraded to 5.0.4 on Node 24 and the Xcode UUID dependency moved to a compatible patched CommonJS version. Final report: 15 high, 0 critical, 0 moderate. Remaining high entries trace to two upstream build-tool advisory roots |

## Data and migration notes

- The external backup remains format version 2, including backwards normalization of older mortgage-only Move records. Those housing assumptions require confirmation again.
- Internal SQLite storage uses an `app_state` metadata record and a `headroom_transactions` table with workspace/id identities. Older single-record state is migrated on the first successful save; its removal is in the same transaction. Stale house KV cleanup follows only after a successful commit.
- Tests use actual Node SQLite for SQL migration, rollback and row-write behaviour. That validates the SQL and transaction design; it does not replace an Expo SQLite check on a phone.
- Readable JSON exports still contain private financial information and exclude pairing/server credentials. The raw recovery archive is deliberately labelled unvalidated and is not a normal importable backup.
- Imports, manual changes, rule changes and coverage updates invalidate stale transaction undo. Plan-only changes can retain undo because it only restores the affected records and associated evidence.

## Verification performed

- TypeScript: passed.
- Vitest: **113 tests passed in 10 files**, using Vitest 5.0.4. Coverage includes debt consistency, mutation rejection, caps/identity/UTF-8 validation, review/manual undo, actuals exclusions and stale previews, rent/mortgage/overlap cases, durable restore receipts, recovery, SQLite rollback/history writes, screen-protection failures and connection-state races.
- Final Android Hermes export: passed (729 modules, 2.2 MB bytecode, one icon font asset). The exported bundle is not an installable APK.
- Expo installed-SDK dependency alignment: passed in offline mode (local SDK compatibility check, not a remote freshness check).
- Xcode's actual UUID-generation path: passed with the patched UUID dependency and an initialized project fixture.
- Current ADB inventory: no connected phone or emulator. No APK install, native screenshots, biometric prompt, app-switcher/screenshot test, TalkBack session or live bank consent was performed.

## Remaining dependency findings

The final npm audit contains 15 high-severity affected package entries, propagated from these two advisory roots:

- `braces` 3.0.3 in Metro's pattern-matching chain: [deep-pattern stack-exhaustion advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- `node-forge` 1.4.0 in Expo's CLI/signing chain: [signature-verification advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv).

Registry checks returned those same versions as the latest published releases during this run. No compatible patched release was available to apply. npm's proposed Expo/React Native downgrades were not used. These are triaged, unresolved dependency reports, not a claim that this app is audit-clean or that a full security scan has established exploitability. Track upstream fixes before distribution.

## P1 release checks still open

1. Install the current app on the Pixel and validate migration, recovery export/restore, manual correction/deletion, selected bulk review and numeric editing with the real keyboard.
2. Verify app lock, credential fallback, background/resume and screenshot/app-switcher protection, including the failed-protection recovery path.
3. Verify TalkBack announcements, focus after modal transitions, masked amounts, large text and navigation.
4. Complete/cancel bank consent against the configured HTTPS service; test offline/stale/expired states and re-pairing.
5. Recheck the two upstream dependency roots for compatible fixes before a release decision.

## Recommended next batch

**P2 first — daily use:** focused Plan/Settings sections, backlog-aware Today actions, evidence checklists, target dates/priorities for goals, persistent sync receipts/direct reconnect, better month navigation, clear-filter controls and Move templates/scenario differences.

**P3 after P2 — refinement:** component/type hierarchy, reduced repetitive card framing, motion tokens and interruption handling, example reset/full walkthrough and finer responsive layouts. Visual choices should be checked on actual phone screenshots before being treated as finished.

P2/P3 have not been started as part of this P1 batch.
