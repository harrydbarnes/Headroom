# Physical-phone test: priorities 0 and 1

16 October 2026. Pixel 11 Pro, serial `67061FDKX000AN`, Android 17. Tested the current working-tree release variant of `uk.co.habylab.headroom` (version label 0.2.3), including the transaction-details feedback fix found during this pass. The version label alone does not identify the patch; the final APK SHA-256 is `ADE0C8E64D001FA6DC4D5BC50DBD46DB074AF9EACD68D1E6E11F74C63C08DF95`.

## Build and installation

The native build succeeded after using an existing workspace-local temporary directory:

```powershell
$env:JAVA_HOME='C:\Dev\Headroom\.qa\toolchain\java\jdk-21.0.12.1+1'
$env:ANDROID_HOME='C:\Dev\Headroom\.qa\toolchain\android-sdk'
$env:GRADLE_USER_HOME='C:\Dev\Headroom\.qa\gradle-cache'
$env:TEMP='C:\Dev\Headroom\.qa\ledger-temp'
$env:TMP=$env:TEMP
$env:EXPO_OFFLINE='1'
$env:CI='1'
$env:NODE_ENV='production'
# Run from android/; create the temporary directory first.
.\gradlew.bat assembleRelease --offline --console=plain
```

The initial native build completed in 5m 55s, with the corrected build completing in 48s. Both assembled the bundled release APK. Kotlin/C++ and Gradle deprecation warnings remained; there were no build errors. Installed using `adb install -r`, without uninstalling or clearing data. This is a test-signed build, not a Play Store release. Google Play Protect's optional upload prompt was declined; device protection settings were not disabled.

## Verified on the phone

Evidence files are local and ignored by Git under `.qa/ledger-phone-2026-10-16/`. PNG screenshots are paired with XML UI-tree captures. Personal backup files in that directory contain readable financial data and should remain private.

| Check | Result | Evidence |
| --- | --- | --- |
| Pre-update backup | Existing native exporter wrote a valid version 2 personal backup to the phone's existing Headroom-QA folder; copied locally before updating | `00`–`07`, `pre-update-personal.json` |
| Existing-data migration | Updated app reopened the fictional workspace and derived the existing three accounts with unknown types/balances, without inventing amounts | `08`, `10` |
| New account | Created a fictional credit-card account with institution metadata in the separate example workspace | `11`–`12` |
| Current/available balances | Saved and displayed -£123.45 current and £876.55 available separately, with manual provenance and date | `13`, `17` |
| Native CSV preview/import | Android document picker selected a synthetic CSV; preview displayed two separate £12.34 purchases and a -£5 refund; all three imported | `18`–`29`, `ledger-test.csv` |
| Duplicate protection | Reopening the same file displayed 3 existing matches, 0 to add; Import was disabled | `30` |
| Activity | Imported rows appeared as unreviewed in the current month; count rose from six to nine transactions | `31`–`32` |
| Annotations | Entered alias, note, two tags, receipt-reference metadata and signed split on the fictional refund | `32`–`35` |
| Exact split validation | A -£5.01 split against a -£5.00 refund was rejected. Correcting to -£5.00 saved successfully | `33`–`35`, corrected-build `39`–`40` |
| Cross-date tag search | Searching for `ledgerqa` with all-date search returned exactly the annotated refund among 31 transactions | `36` |
| Persistence through APK update | Reinstalled corrected APK, reopened refund, and confirmed alias, note, tags, receipt reference and split survived | `37`; balance confirmed again in `41` |
| Native CSV export | Folder picker saved a real CSV. Independent local parsing found exactly three parent rows, correct signed amounts, and only the selected account; no split child duplicated the parent | `42`–`43`, `exported-transactions.csv` |
| Import rollback | Cancel left the import intact. Confirm removed the three imported rows and their annotations; Activity returned to six current-month rows and three needing review | `44`–`45` |
| Archive/reopen | Fictional card archived and reopened successfully | `46`–`47` |
| Amount masking | Both current and available balances changed to hidden values in the rendered UI and accessibility tree; original visibility restored afterward | `47`–`48` |
| Personal isolation | Exported version 3 personal backup after testing. Every original workspace field exactly matched the pre-update backup; only the empty ledger was added | `49`–`50`, `post-test-personal.json`, `personal-preservation-result.txt` |
| Native restore | Chose that independently verified identical personal backup, saw validation/replace confirmation, and completed restore with explicit saved receipt | `51`–`52` |
| Final state | Returned to personal Today with original amount visibility; no real bank was paired or statement imported | `53` |

The test CSV and exports remain in the phone's Headroom-QA folder. The three synthetic imported transactions and their annotations were rolled back. A fictional card and its manual balance remain only in the example workspace for inspection. The synthetic CSV also exists in Downloads. No personal financial transactions were created or removed.

## Defect fixed and retested

An invalid split was correctly blocked, but its error appeared below all accounting-treatment and category controls, away from the transaction-details Save button. The error now appears directly beneath that button. Editing a field clears stale feedback, including the previous success message. Rebuilt, reinstalled without data loss, and verified both the visible mismatch error and successful correction on the phone (`39`–`40`). Typechecking and all 159 tests in 13 files pass after this change.

## Proof boundaries

This is a scoped functional pass, not complete release certification. No live-bank consent, retrieval, balances, pending settlement or provider-specific coverage was tested. Automatic provider balances remain unsupported. Receipt references were tested as metadata; no receipt-image storage is claimed. Native backup/restore used the unchanged personal workspace, which had no transactions; populated annotation/ledger backup roundtrips and failed-write rollback remain covered by the automated fixtures rather than a second physical installation.

TalkBack, 200% text, rotation/tablet layouts, every amount-range combination, debit/credit CSV mapping, cancelled/error picker paths, deliberate storage-failure injection, manual-deletion undo and notification/background behaviour were not comprehensively repeated in this pass. The existing 14 high-severity dependency audit findings and undispatched CI checks remain open. No Headroom fatal error was observed in the current-run crash log; an unrelated process's crash was inspected and excluded.
