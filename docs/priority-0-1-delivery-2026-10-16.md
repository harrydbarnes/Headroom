# Priorities 0 and 1: implementation and release evidence

16 October 2026. Source baseline: 0.2.3. This change extends the current app; it is not a published release. No real banking consent was created. The current APK has now been installed and tested on the connected phone using the isolated fictional workspace; personal data preservation was independently checked against exported backups. See [phone test evidence](device-test-ledger-2026-10-16.md).

## Priority 0

The baseline passed 147 tests before implementation. The release-readiness source passes 165 tests in 16 files, TypeScript checking, and an Android Hermes bundle export (747 modules). Localhost server tests need execution outside the restricted sandbox; their initial EACCES/file-rename failures disappeared with that access.

Storage now writes metadata version 4 and accepts version 3. Before the first upgrade write, the previous metadata and transaction records are archived in `headroom_migrations` in the same SQLite transaction. Failed writes leave both the prior state and migration archive unchanged. Raw recovery exports include that archive. The archive contains private financial records and remains in app-private SQLite, alongside the existing unencrypted financial database; it is not an encrypted document vault. Existing personal/example isolation and recovery-blocked editing remain in force.

Backups now write version 3, while accepting old version 2 backups. This deliberately prevents older app builds from accepting and silently dropping the new ledger. Importing old backups derives accounts from their historical labels, keeps transactions unchanged, leaves account types unknown for user confirmation, and leaves balances unknown. JSON backups remain the full recovery format; CSV is transaction portability only. Keep an exported version 2 backup before upgrading if reverting to an older app is required.

Compatible patches installed: Expo 57.0.30 and Vitest 5.0.5. Expo's dependency tree initially installed a nested SDK 58 peer; the `expo: $expo` override constrains it to the declared SDK 57 range. Android export passes with the corrected tree. The audit still reports 14 high-severity dependency entries for two upstream advisories without published fixed versions. Exact-version, hash-verified local dependency mitigations and regression tests now cover both affected paths; CI preserves the audit counts and rejects new advisories. This is not a zero-audit claim. Forced major downgrades were not applied. CI now validates types, tests and Android export on PRs/main pushes. The manually dispatched preview workflow builds a bundled release-variant APK with Java 21; this uses generated test signing, not production signing.

The earlier loopback build blocker was resolved by setting TEMP and TMP to an existing workspace-local directory. Native release builds completed, and the corrected APK was installed and exercised on the Pixel 11 Pro. The phone pass covered migration, fictional accounts/balances, duplicate import preview, CSV export/rollback, annotations, split validation, tag search, archive/reopen, masking, persistence and native personal backup/restore. GitHub validation passed on code revision `4004ec1` (run 38915635165); an APK build passed on the preceding `af2ba34` (run 38914941771). Final-revision APK run 38915630361 also passed and uploaded the preview artifact. The follow-up phone pass covers 200% text, landscape and tablet-width emulation; TalkBack/keyboard acceptance and live-bank verification remain open. See the [readiness phone report](device-test-readiness-2026-10-16.md) for exact proof boundaries.

## Priority 1 inventory

| Capability | Source implementation | Verification boundary |
| --- | --- | --- |
| Account records | Stable IDs; unknown/cash/current/savings/card/loan/mortgage/investment/pension types; GBP; institution; personal/joint/business group; archive; future budget inclusion | Phone: migration, creation, archive/reopen; domain fixtures |
| Balance snapshots | Signed current and optional available amounts; source/date; unknown/current/stale/future display; never substitute a credit limit or transaction sum | Phone: signed current/available, masking, relaunch; manual entry only |
| CSV import | Exact header mapping; single signed amount or debit/credit columns; ISO/UK dates; integer pence; account selection; preview; repeated-row occurrence IDs; existing-match exclusion; durable mapping and import receipt | Phone: native picker/import/repeat preview; domain and SQLite fixtures |
| CSV rollback | Confirmation removes receipt-owned rows and annotations; invalidates affected coverage confirmations | Phone: cancellation and confirmed rollback |
| CSV export | Account/date/category filters, signed amounts, quoting and spreadsheet-formula protection | Phone: native folder picker and independently inspected CSV; roundtrip fixtures |
| Source/annotations | Notes, tags, merchant aliases, receipt-reference metadata and signed category splits are separate from source transactions | Phone: all annotation fields and exact-sum rejection/acceptance, retained across APK update; backup/persistence fixtures |
| Search | Merchant/account/category/notes/tags/aliases, all dates, amount bounds and existing filters | Phone: tag search across all dates; amount-bound combinations remain untested on phone |
| Undo | Deleting a manual transaction removes its evidence; undo restores it; later evidence edits invalidate stale undo | Store fixture |
| Provider capabilities | Current path explicitly reports booked GBP transactions, up to 180-day requested history, manual refresh; balances/pending/scheduled refresh unsupported | Source inspection; exact bank/card coverage unverified |

Migrated account names stay fixed to preserve existing transaction identities. Edit their type, institution and ownership in Accounts. Account inclusion is recorded for the upcoming budgeting engine; it does not alter the existing manually confirmed Plan. The existing server stays single-owner and token protected; ownership groups are local labels, not sharing permissions. Multi-user/server identity work remains priority 7.

Pending transactions are not fabricated or imported. Future support needs separate pending identities and settlement reconciliation before enabling it. No live balance API is claimed. Source corrections which conflict with confirmed splits are rejected rather than silently changing the split evidence.

CSV precautions: mapping uses pounds, a decimal point and no thousands separators. Preview conservatively skips all rows matching an existing account/date/merchant/amount, including possible CSV/bank overlap; repeated genuine payments in a new file receive separate identities. If an existing identical payment is genuinely separate, review the statement and add it manually. Formula-like text is apostrophe-prefixed for spreadsheet safety. Export contains parent transactions, not child splits. Full annotations, snapshots and receipts are in JSON backup. Receipt references are metadata; the referenced files are not copied or backed up. Rollback removes later annotations on those imported rows after confirmation.

## Phone acceptance before release

1. Privately export the currently installed app's JSON backup before upgrading. Install the newly built APK and verify the old personal/example data, existing bank status and manual Plan remain intact.
2. In Accounts add a fictional credit-card account, record a negative current balance and optional available amount, and verify the date, sign and masking. Change ownership/type, archive/reopen, and restart the app.
3. Select a fictional account; import a CSV with two identical legitimate payments plus one credit. Review the mapped preview, import, reopen, and import the same file again: no additional rows. Check a known overlap with a bank-style row and inspect the skip count.
4. In Activity open one imported row, add notes/tags/alias/receipt reference and two exact-sum splits. Reject a one-penny mismatch. Search across months by tag and amount. Check existing monthly totals count the parent once.
5. Export filtered CSV and full JSON. Restore the JSON on a test installation and verify balances, mapping, splits and import receipts. Roll back the import after confirmation and check annotations and coverage are removed together. Verify manual deletion undo restores evidence.
6. Exercise cancelled picker, invalid dates/decimals, duplicate headers, interrupted save, recovery, large text, TalkBack, keyboard, privacy cover and relaunch. Confirm current source on compact/landscape layouts.

Priorities 0 and 1 have implemented source foundations, dependency mitigations, automated CI validation and successful scoped physical-phone passes. Accounts now includes a five-step Enable Banking setup guide, including private-server configuration and gated bank consent/import actions. Full TalkBack/keyboard acceptance and live-provider verification remain open; neither priority is marked fully release-certified. Real banking still requires owner provisioning described in [Enable Banking setup](enable-banking-onboarding.md).
