# Headroom copy fix-ups, 18 October 2026

Base: `8ae0253`, merged PR 14 on `main`. Six ordered pull requests.

## Change log

1. Privacy: distinguish Headroom's own encryption from phone protection. Explain the server cache. Describe server connection credentials rather than bank login details. Qualify backup exclusion as application behaviour, since user notes can contain arbitrary text.
2. Error layer: one exact-entry catalogue and ordered patterns in errors.ts. Compatibility exports in messages.ts contain no tables. The one-off AST extraction captured 172 old keys and both old entry-point outputs before replacing the tables. The fixture regression preserves the old precedence, including warning passthrough. All eight calculator guards now have specific input messages: projection, debt projection, buyer type, tax period, non-negative money, percentage, rate and mortgage term. These validate data reaching calculators from forms or imports, so none was dismissed as internal-only. The reported empty-message throw is now a store-message-or-fallback expression in useBanking; both branches are covered without changing behaviour. The AST coverage additionally found and mapped dynamic CSV row messages, missing record references and reconciliation reasons. Reviewed dynamic exceptions carry written reasons in the coverage test. No thrown literal changed, and no error constants were introduced.
3. Terminology: presentation values use pairing link, device token, your Headroom server and server address. Updated the server helper's console instruction, README setup path and Settings address placeholder. Exact internal thrown keys, routes and environment variables remain unchanged. The regression fixture's presentation outputs were updated for these intentional wording changes; its raw inputs remain fixed. Copy lint rejects the six banned setup phrases in presentation values. Internal exception keys are exempt because they are exact-match contracts, not presentation text.
4. String cleanup: renamed keys mechanically with the TypeScript checker, removed dead and duplicate entries, moved authentication prompts to current Settings copy, removed punctuation keys, and merged 50 complete text elements. Added exported-key structure and reference checks with explicit reasons for dynamic theme and CSV labels. No copy changed. The parity manifest accounts for required dead-key deletions as well as punctuation and fragment merges.
5. Inline copy: moved the remaining Move constraint messages, setup and pension section names, scenario default and status labels into strings. Used the proposed plain-language constraints while retaining lender and solicitor checks. Source labels follow the same pattern. Updated server application checks against server/banking.ts:17 and kept manual refresh, booked-transaction and pending/balance limits. Pension matching help was checked against pensionFunding in src/lib/pensions.ts:17: each upTo is the upper employee percentage of a marginal band, multiplied by that band's match percentage. No statutory limit, pension or tax calculation changed. Split 51 simple semicolon joins into sentences without dropping caveats. The error fixture's expected presentation punctuation was updated intentionally; internal exact keys remain unchanged. Recursive lint now covers screens, UI and services, with zero prose exceptions. Existing stored labels and the legacy Settings route request were extracted unchanged to presentationKeys.ts.

## Claims audit

Code references establish implementation, not a deployed host's security configuration or a physical phone's behaviour. Historical delivery and device reports describe their dated evidence, not current certification.

| Claim | Code evidence | Verdict |
| --- | --- | --- |
| Own data is stored on this phone | `src/state/persistence.ts:8`, `src/state/persistence.ts:17` | Supported: app-private SQLite records |
| Headroom does not add database encryption | `src/state/persistence.ts:8`, `src/state/persistence.ts:33` | Supported: plain serialised records passed to SQLite; this says nothing about Android storage encryption |
| Phone storage encryption and screen lock apply if configured | `App.tsx:40`, `src/state/persistence.ts:8` | Platform protection, conditional wording retained; phone configuration was not inspected |
| App lock gates opening and returning to Headroom | `App.tsx:36`, `App.tsx:38`, `App.tsx:40`, `App.tsx:42` | Supported: authentication gates visible content, background relocks; no encryption claim |
| Amounts remain visible in editable fields | `src/ui/components.tsx:21`, `src/ui/components.tsx:22`, `src/ui/components.tsx:31` | Supported: amount hiding is a presentation control, not a change to form drafts |
| Linked bank data is also cached on the server | `server/banking.ts:31`, `server/banking.ts:45` | Supported |
| Server connection credentials, sessions and cached transactions are encrypted | `server/banking.ts:6`, `server/banking.ts:7`, `server/banking.ts:9`, `server/banking.ts:17`, `server/banking.ts:22`, `server/banking.ts:45` | Supported: AES-GCM with record-specific authenticated data |
| Bank login details are encrypted on the server | `server/banking.ts:20`, `server/banking.ts:21` | Removed: the app selects bank authentication without required credential inputs and redirects through the bank flow; it does not store a bank password |
| Headroom does not add bank tokens or server credentials to backups | `src/services/backup.ts:9`, `src/lib/workspace.ts:105`, `src/lib/workspace.ts:57`, `src/services/api.ts:7` | Supported: validated financial records only; connection credentials live separately. Arbitrary notes are included, so an absolute promise about all file contents was softened |
| Backups are readable files; restore replaces financial data | `src/lib/workspace.ts:105`, `src/lib/workspace.ts:106`, `src/services/backup.ts:15`, `src/state/store.ts:43` | Supported: JSON export and validated restore; phone link remains separate |
| Android backup is switched off | `app.json:12` | Supported: `allowBackup: false`; an installed build was not checked |
| Deleting financial data does not remove bank permission or the phone link | `src/state/store.ts:42`, `src/lib/workspace.ts:24`, `src/services/api.ts:10`, `server/banking.ts:23` | Supported: local clear never calls server disconnect or forgetConnection |
| Unlinking only removes this phone's saved connection | `src/services/api.ts:10` | Supported; no server revocation request |
| Disconnecting removes provider permission and server cache; local transactions remain | `server/banking.ts:23`, `src/services/useBanking.ts` (`disconnect`) | Supported: provider DELETE precedes session/cache deletion; local ledger not cleared |
| Private signing key remains on the server | `server/index.ts:17`, `src/services/api.ts:9`, `server/index.ts:39` | Supported for the application flow; operators must keep keys private |
| Device token uses protected phone storage | `src/services/api.ts:7`, `src/services/api.ts:9` | Supported: SecureStore, separate from financial export |
| Screenshot and recent-app protection | `src/ui/ScreenProtection.tsx:6`, `App.tsx:41` | Native prevention API and content gating implemented; device verification remains required |
| Example data is separate from personal data | `src/lib/workspace.ts:10`, `src/state/store.ts:41`, `src/lib/workspace.ts:43` | Supported: separate personal/example records and active-data selection |
| Pairing link works once and expires after two minutes | `server/pairing.ts:6`, `server/pairing.ts:7` | Supported: in-memory consume removes the issued ticket and checks age |
| Bank sign-in uses short-lived browser binding and one-use state | `server/index.ts:15`, `server/index.ts:26`, `server/index.ts:28`, `server/banking.ts:22` | Supported: signed cookie checks, Secure/HttpOnly/SameSite cookie, state compare-and-swap |
| No money is moved; bank refresh is manual | `server/index.ts:39`, `src/services/api.ts:12`, `src/services/useBanking.ts` | Supported: read-only account aggregation, explicit refresh; no payment endpoint |

## Decisions needed

* Required data-detail wording referred to bank login details. Code proves encryption of server connection credentials, not storage of bank passwords. Replaced that noun only.
* Backups contain free text. No implementation can promise that users never put a secret in a note. The backup help describes what Headroom adds and tells users that notes are included.
* Phone encryption is conditional platform behaviour, not something this repository enables or verifies. No claim of a verified phone configuration is made.
* Historical delivery reports retain their dates and proof boundaries. They are not evidence that this change has been tested on a device.
* Workstream 6 explicitly authorises its listed date-validation and feedback changes as narrow exceptions to the general text-only rule.
* The repository cannot prove exclusive control of an operator's host or the contents of every distributed APK and Git history. Replaced “only you control” with “your Headroom server”, and converted the README's absolute no-credentials assertion into an instruction to keep credentials out of builds and source.
* The explicit deletion manifest for workstream 4 was approved by the user during this chat.

## Key rename map

The complete old-to-new map, removals and sentence source parts are in [copy-key-map.json](copy-key-map.json). It records each key's old module/object path, its new path or deletion, and its reason. Manual role names include activity.emptyMonth, plan.goalTargetMonthLabel, baselineDraftHelp, csvMappingHelp, disconnectConfirmBody and schemeEvidenceDetail. The three live Settings authentication prompts moved to settingsRework.ts; settings.ts was deleted. All separator keys were removed. Empty logic values and punctuation joiners are now local literals. The two-character On status is also a local literal so no short exported fragment remains. Dynamic nested theme and CSV-column labels have explicit reasons in tests/string-structure.ts.

| Old key | New key | Reason |
| --- | --- | --- |
| `src/strings/shell.ts:shellCopy.separator` | Removed | punctuation |
| `src/strings/shell.ts:shellCopy.deviceAuthenticationIsUnavailableCheckYourPhone` | `src/strings/shell.ts:shellCopy.authenticationUnavailable` | rename |
| `src/strings/shell.ts:shellCopy.applyingScreenProtectionBeforeOpeningYourData` | `src/strings/shell.ts:shellCopy.protectionPending` | rename |
| `src/strings/shell.ts:shellCopy.youReViewingExampleDataYourData` | `src/strings/shell.ts:shellCopy.exampleModeNotice` | rename |
| `src/strings/shell.ts:shellCopy.navigate2` | `src/strings/shell.ts:shellCopy.navigateTitle` | rename |
| `src/strings/shell.ts:shellCopy.tapBelowWhenYouAreReadyTo2` | `src/strings/shell.ts:shellCopy.screenCoverDetail` | rename |
| `src/strings/shell.ts:shellCopy.saving2` | `src/strings/shell.ts:shellCopy.savingStatus` | rename |
| `src/strings/shell.ts:shellCopy.saved2` | `src/strings/shell.ts:shellCopy.savedStatus` | rename |
| `src/strings/format.ts:counts.existingTransaction` | Removed | unused |
| `src/strings/recovery.ts:recoveryCopy.separator` | Removed | punctuation |
| `src/strings/recovery.ts:recoveryCopy.message3` | `src/strings/recovery.ts:recoveryCopy.restoreConfirmBody` | rename |
| `src/strings/recovery.ts:recoveryCopy.editingIsPausedDefaultOrExampleValues` | `src/strings/recovery.ts:recoveryCopy.editingPaused` | rename |
| `src/strings/recovery.ts:recoveryCopy.exportsContainPrivateFinancialInformation` | `src/strings/recovery.ts:recoveryCopy.exportPrivacySummary` | rename |
| `src/strings/recovery.ts:recoveryCopy.exportsContainPrivateFinancialInformationSaveThem` | `src/strings/recovery.ts:recoveryCopy.exportPrivacyDetail` | rename |
| `src/strings/recovery.ts:recoveryCopy.shareSheetClosedConfirmTheDestinationSaved` | `src/strings/recovery.ts:recoveryCopy.backupShareReceipt` | rename |
| `src/strings/recovery.ts:recoveryCopy.recoveryRecordsExportedKeepThemPrivate` | `src/strings/recovery.ts:recoveryCopy.recoveryRecordsExportedText` | rename |
| `src/strings/recovery.ts:recoveryCopy.shareSheetClosedConfirmTheDestinationSaved2` | `src/strings/recovery.ts:recoveryCopy.archiveShareReceipt` | rename |
| `src/strings/recovery.ts:recoveryCopy.ifStorageItselfIsUnavailableRestoreWill` | `src/strings/recovery.ts:recoveryCopy.restoreUnavailableHelp` | rename |
| `src/strings/today.ts:todayCopy.useIncomeAfterTaxAndPayrollDeductions` | `src/strings/today.ts:todayCopy.useIncomeAfterText` | rename |
| `src/strings/today.ts:todayCopy.essentialsIncludingMortgageRentAndDebtMinimums` | `src/strings/today.ts:todayCopy.essentialsIncludingMortLabel` | rename |
| `src/strings/today.ts:todayCopy.annualBillsDividedBy12` | `src/strings/today.ts:todayCopy.annualBillsDividedByLabel` | rename |
| `src/strings/today.ts:todayCopy.emergencyCashExcludingGoalSavings` | `src/strings/today.ts:todayCopy.emergencyCashExcludingLabel` | rename |
| `src/strings/today.ts:todayCopy.thisUsesYourPlannedSpendingNotYour` | `src/strings/today.ts:todayCopy.usesPlannedSpendingText` | rename |
| `src/strings/today.ts:todayCopy.message16` | `src/strings/today.ts:todayCopy.setupChecklist` | rename |
| `src/strings/today.ts:todayCopy.confirmActualValuesInPlanZeroIs` | Removed | unused |
| `src/strings/today.ts:todayCopy.afterPlannedSpendingAndAnnualReserves` | Removed | unused |
| `src/strings/today.ts:todayCopy.provisionalConfirmYourBaselineInPlan` | `src/strings/today.ts:todayCopy.provisionalConfirmBaselText` | rename |
| `src/strings/today.ts:todayCopy.stillNeedYourReviewSkippedValuesRemain` | Removed | unused |
| `src/strings/today.ts:todayCopy.limitsOverlapDoNotAddThemTogether` | `src/strings/today.ts:todayCopy.limitsOverlapDoText` | rename |
| `src/strings/today.ts:todayCopy.yourConfirmedSchemeTermsShowAdditionalEmployer` | `src/strings/today.ts:todayCopy.confirmedSchemeTermsDetail` | rename |
| `src/strings/today.ts:todayCopy.message49` | `src/strings/today.ts:todayCopy.reviewBacklog` | rename |
| `src/strings/today.ts:todayCopy.bankPermissionExpiredReconnectToRefreshTransactions` | `src/strings/today.ts:todayCopy.bankPermissionExpiredText` | rename |
| `src/strings/today.ts:todayCopy.completeAndConfirmYourSavedBaseline` | `src/strings/today.ts:todayCopy.completeConfirmSavedText` | rename |
| `src/strings/today.ts:todayCopy.yourPlanSpendsMoreThanYourIncome` | `src/strings/today.ts:todayCopy.planSpendsMoreText` | rename |
| `src/strings/today.ts:todayCopy.reviewYourDebtBalancesAndCostsBefore` | `src/strings/today.ts:todayCopy.reviewDebtBalancesText` | rename |
| `src/strings/today.ts:todayCopy.giveYourRemainingMoneyAPurposeIn` | `src/strings/today.ts:todayCopy.giveRemainingMoneyText` | rename |
| `src/strings/today.ts:todayCopy.separator` | Removed | punctuation |
| `src/strings/today.ts:todayCopy.seeAccountsForEachBankSDownload` | Removed | unused |
| `src/strings/today.ts:todayCopy.youConfirmEachMonthIsCompleteHeadroom` | `src/strings/today.ts:todayCopy.confirmEachMonthDetail` | rename |
| `src/strings/today.ts:todayCopy.message75` | `src/strings/today.ts:todayCopy.scoreValue` | rename |
| `src/strings/today.ts:todayCopy.message77` | `src/strings/today.ts:todayCopy.scoreBreakdown` | rename |
| `src/strings/today.ts:todayCopy.confirmABaselineAllAccountCoverageAnd` | `src/strings/today.ts:todayCopy.confirmABaselineAllText` | rename |
| `src/strings/today.ts:todayCopy.confirmed2` | `src/strings/today.ts:todayCopy.confirmedDetail` | rename |
| `src/strings/today.ts:todayCopy.threeCashReflectsEmergencySavingsHeadroomReflects` | Removed | unused |
| `src/strings/today.ts:todayCopy.reviewedEssentialsFlexibleThisMonth` | `src/strings/today.ts:todayCopy.reviewedEssentialsFlexiLabel` | rename |
| `src/strings/today.ts:todayCopy.outsideTheseCategoriesIncludingAnnualBillsTotal` | `src/strings/today.ts:todayCopy.outsideTheseCategoriesSummary` | rename |
| `src/strings/today.ts:todayCopy.outsideTheseCategoriesIncludingAnnualBillsTotal2` | `src/strings/today.ts:todayCopy.outsideTheseCategoriesDetail` | rename |
| `src/strings/today.ts:todayCopy.theyAreExcludedFromThisComparisonThis` | `src/strings/today.ts:todayCopy.theyExcludedComparisonDetail` | rename |
| `src/strings/today.ts:todayCopy.thisReplacesOnlyExampleDataClassificationsCoverage` | `src/strings/today.ts:todayCopy.replacesExampleDataDetail` | rename |
| `src/strings/today.ts:todayCopy.yourSavedExampleDataAreFromAn2` | `src/strings/today.ts:todayCopy.oldExampleHelp` | rename |
| `src/strings/today.ts:todayCopy.resetExampleData2` | `src/strings/today.ts:todayCopy.resetExampleDataTitle` | rename |
| `src/strings/today.ts:todayCopy.message102` | `src/strings/today.ts:todayCopy.guideProgress` | rename |
| `src/strings/today.ts:todayCopy.allAmountsStatementsAndConfirmationsShownHere` | `src/strings/today.ts:todayCopy.allAmountsStatementsText` | rename |
| `src/strings/today.ts:todayCopy.separator2` | Removed | punctuation |
| `src/strings/today.ts:todayCopy.continueExploringReplayTheGuideWithYour` | `src/strings/today.ts:todayCopy.continueExploringReplayDetail` | rename |
| `src/strings/plan.ts:planCopy.yourMonthlyBaselineIsYourConfirmedMonthly` | `src/strings/plan.ts:planCopy.baselineDefinition` | rename |
| `src/strings/plan.ts:planCopy.separator` | Removed | punctuation |
| `src/strings/plan.ts:planCopy.changesNeedConfirmationReviewThemBelow` | `src/strings/plan.ts:planCopy.baselineUnconfirmed` | rename |
| `src/strings/plan.ts:planCopy.incomeSpendingAndAnnualReserves` | `src/strings/plan.ts:planCopy.incomeSpendingAnnualSummary` | rename |
| `src/strings/plan.ts:planCopy.essentialsIncludingHousingAndDebtMinimums` | `src/strings/plan.ts:planCopy.essentialsLabel` | rename |
| `src/strings/plan.ts:planCopy.yearlyBillsConvertedToMonthlyReserve` | `src/strings/plan.ts:planCopy.yearlyBillsConvertedLabel` | rename |
| `src/strings/plan.ts:planCopy.closingWithoutApplyingDiscardsThisSectionDraft` | `src/strings/plan.ts:planCopy.discardDraftHelp` | rename |
| `src/strings/plan.ts:planCopy.emergencyCashExcludingGoalSavings` | `src/strings/plan.ts:planCopy.emergencyCashExcludingLabel` | rename |
| `src/strings/plan.ts:planCopy.balancesInterestRateAPRAndPayments` | `src/strings/plan.ts:planCopy.balancesInterestRateSummary` | rename |
| `src/strings/plan.ts:planCopy.recordEachNonMortgageDebtSeparatelyInclude` | `src/strings/plan.ts:planCopy.debtListHelp` | rename |
| `src/strings/plan.ts:planCopy.savedSeparatelyFromEmergencyCash` | `src/strings/plan.ts:planCopy.savedSeparatelyEmergencLabel` | rename |
| `src/strings/plan.ts:planCopy.remainingPastOrCurrentDeadlinesUseOne` | Removed | unused |
| `src/strings/plan.ts:planCopy.removeGoal2` | `src/strings/plan.ts:planCopy.removeGoalConfirm` | rename |
| `src/strings/plan.ts:planCopy.itsMonthlyFundingNeedWillLeaveYour` | `src/strings/plan.ts:planCopy.monthlyFundingNeedText` | rename |
| `src/strings/plan.ts:planCopy.separator2` | Removed | punctuation |
| `src/strings/plan.ts:planCopy.perMonthChooseWhichDeadlinesOrAmounts` | `src/strings/plan.ts:planCopy.perMonthChooseText` | rename |
| `src/strings/plan.ts:planCopy.debtAt8APROrHigherComes2` | `src/strings/plan.ts:planCopy.allocationDetail` | rename |
| `src/strings/plan.ts:planCopy.shareOfEligibleRemainingSurplus` | `src/strings/plan.ts:planCopy.shareEligibleRemainingLabel` | rename |
| `src/strings/plan.ts:planCopy.wereSkippedDuringSetupReviewTheirSections` | Removed | unused |
| `src/strings/plan.ts:planCopy.whichExceedsEssentialsIncludeThesePaymentsIn` | `src/strings/plan.ts:planCopy.whichExceedsEssentialsDetail` | rename |
| `src/strings/plan.ts:planCopy.baselineConfirmed2` | `src/strings/plan.ts:planCopy.baselineConfirmedTitle` | rename |
| `src/strings/plan.ts:planCopy.confirmIncomeEssentialsIncludingDebtMinimumsFlexible` | `src/strings/plan.ts:planCopy.baselineConfirmHelp` | rename |
| `src/strings/plan.ts:planCopy.youConfirmEachMonthIsCompleteHeadroom` | `src/strings/plan.ts:planCopy.confirmEachMonthDetail` | rename |
| `src/strings/plan.ts:planCopy.separator3` | Removed | punctuation |
| `src/strings/plan.ts:planCopy.nothingChangesUntilYouReviewTheComparison` | Removed | unused |
| `src/strings/plan.ts:planCopy.reviewBaselineChange` | `src/strings/plan.ts:planCopy.reviewProposedBaselineChange` | duplicate |
| `src/strings/plan.ts:planCopy.separator4` | Removed | punctuation |
| `src/strings/plan.ts:planCopy.inEssentialsAndFlexibleAreIncluded` | Removed | unused |
| `src/strings/plan.ts:planCopy.areExcluded` | Removed | unused |
| `src/strings/plan.ts:planCopy.aCategoryInActivityBeforeYouCan` | Removed | unused |
| `src/strings/plan.ts:planCopy.message102` | `src/strings/plan.ts:planCopy.excludedAccountLabel` | rename |
| `src/strings/plan.ts:planCopy.recategoriseTheseInActivityIfTheyBelong` | Removed | unused |
| `src/strings/plan.ts:planCopy.iHaveCheckedThisOtherSpendingAnd` | `src/strings/plan.ts:planCopy.iHaveCheckedLabel` | rename |
| `src/strings/plan.ts:planCopy.message106` | `src/strings/plan.ts:planCopy.excludedAccountLabel` | duplicate |
| `src/strings/plan.ts:planCopy.excludeTheseAnnualBillsAndRetainMy` | `src/strings/plan.ts:planCopy.excludeTheseAnnualLabel` | rename |
| `src/strings/plan.ts:planCopy.incomeTransfersAndDebtRepaymentsAreNot` | `src/strings/plan.ts:planCopy.incomeTransfersDebtDetail` | rename |
| `src/strings/plan.ts:planCopy.thisLeavesTheBaselineUnconfirmedReviewThe` | `src/strings/plan.ts:planCopy.leavesBaselineUnconfirmText` | rename |
| `src/strings/plan.ts:planCopy.noNonMortgageDebtsRecordedAddEach` | `src/strings/plan.ts:planCopy.emptyDebts` | rename |
| `src/strings/plan.ts:planCopy.minimumPaymentAlreadyIncludedInEssentialsOptional` | `src/strings/plan.ts:planCopy.minimumPaymentAlreadyLabel` | rename |
| `src/strings/plan.ts:planCopy.referenceOnlyThisIsNotDeductedAgain` | `src/strings/plan.ts:planCopy.debtMinimumHelp` | rename |
| `src/strings/plan.ts:planCopy.remove2` | `src/strings/plan.ts:planCopy.removeTitle` | rename |
| `src/strings/plan.ts:planCopy.monthPreviouslyConfirmedReviewThisChecklistTo` | `src/strings/plan.ts:planCopy.monthReconfirmHelp` | rename |
| `src/strings/plan.ts:planCopy.checkTheFullMonthAgainstEveryStatement` | `src/strings/plan.ts:planCopy.coverageSummary` | rename |
| `src/strings/plan.ts:planCopy.checkTheFullMonthAgainstEveryStatement2` | `src/strings/plan.ts:planCopy.coverageDetail` | rename |
| `src/strings/plan.ts:planCopy.addAnAccountWithoutImportedActivity` | `src/strings/plan.ts:planCopy.addAccountWithoutLabel` | rename |
| `src/strings/plan.ts:planCopy.thisChecklistIncludesAllMyAccountsCash` | `src/strings/plan.ts:planCopy.checklistIncludesAllLabel` | rename |
| `src/strings/plan.ts:planCopy.reviewEveryTransactionBeforeConfirming` | `src/strings/plan.ts:planCopy.reviewEveryTransactionText` | rename |
| `src/strings/activity.ts:activityCopy.separator` | Removed | punctuation |
| `src/strings/activity.ts:activityCopy.aTransactionWithThisMerchantAccountDate` | `src/strings/activity.ts:activityCopy.duplicateConfirmBody` | rename |
| `src/strings/activity.ts:activityCopy.resultsIncludeAllDatesTheSummaryUses` | `src/strings/activity.ts:activityCopy.allDatesSummary` | rename |
| `src/strings/activity.ts:activityCopy.separator2` | Removed | punctuation |
| `src/strings/activity.ts:activityCopy.of` | Removed | fragment |
| `src/strings/activity.ts:activityCopy.message20` | `src/strings/activity.ts:activityCopy.transactionDetailsLabel` | rename |
| `src/strings/activity.ts:activityCopy.needsReview2` | `src/strings/activity.ts:activityCopy.reviewStatus` | rename |
| `src/strings/activity.ts:activityCopy.message24` | `src/strings/activity.ts:activityCopy.transactionCaption` | rename |
| `src/strings/activity.ts:activityCopy.changeTheFiltersToSeeOtherTransactions` | `src/strings/activity.ts:activityCopy.emptyFilterHint` | rename |
| `src/strings/activity.ts:activityCopy.message27` | `src/strings/activity.ts:activityCopy.emptyMonth` | rename |
| `src/strings/activity.ts:activityCopy.transfersAndCardRepaymentsAreExcludedRefunds` | `src/strings/activity.ts:activityCopy.totalsExclusionsHelp` | rename |
| `src/strings/activity.ts:activityCopy.message36` | `src/strings/activity.ts:activityCopy.selectTransactionLabel` | rename |
| `src/strings/activity.ts:activityCopy.selectCheckboxesToReviewSeveralTransactionsOr` | `src/strings/activity.ts:activityCopy.selectionHelp` | rename |
| `src/strings/activity.ts:activityCopy.onlyShowTransactionsNeedingReview` | `src/strings/activity.ts:activityCopy.reviewFilterLabel` | rename |
| `src/strings/activity.ts:activityCopy.transactionDatesAloneCannotEstablishStatementCompleteness` | `src/strings/activity.ts:activityCopy.completenessHelp` | rename |
| `src/strings/activity.ts:activityCopy.message58` | `src/strings/activity.ts:activityCopy.reviewSelectionTitle` | rename |
| `src/strings/activity.ts:activityCopy.message59` | `src/strings/activity.ts:activityCopy.transactionCaption` | duplicate |
| `src/strings/activity.ts:activityCopy.thisAppliesOneTypeAndCategoryTo` | `src/strings/activity.ts:activityCopy.appliesOneTypeText` | rename |
| `src/strings/activity.ts:activityCopy.separator3` | Removed | punctuation |
| `src/strings/activity.ts:activityCopy.thisSelectionIncludesMoneyInAndMoney` | `src/strings/activity.ts:activityCopy.selectionIncludesMoneyDetail` | rename |
| `src/strings/activity.ts:activityCopy.checkTheTypeAndCategoryAgreeType` | `src/strings/activity.ts:activityCopy.checkTypeCategoryDetail` | rename |
| `src/strings/activity.ts:activityCopy.rulesApplyToNewTransactionsNeedingReview` | `src/strings/activity.ts:activityCopy.rulesApplyNewDetail` | rename |
| `src/strings/activity.ts:activityCopy.severalPossibleCounterpartsMatchThisAmountAnd` | `src/strings/activity.ts:activityCopy.severalPossibleCounterpDetail` | rename |
| `src/strings/activity.ts:activityCopy.separator4` | Removed | punctuation |
| `src/strings/activity.ts:activityCopy.checkBothSidesYourselfThisIsOnly` | `src/strings/activity.ts:activityCopy.checkBothSidesText` | rename |
| `src/strings/activity.ts:activityCopy.message74` | `src/strings/activity.ts:activityCopy.transferConfirmBody` | rename |
| `src/strings/activity.ts:activityCopy.itsMonthWillNeedReconfirmationYouCan` | `src/strings/activity.ts:activityCopy.monthWillNeedText` | rename |
| `src/strings/activity.ts:activityCopy.downloadedAmountsDatesAndAccountDetailsCan` | `src/strings/activity.ts:activityCopy.downloadedAmountsDatesDetail` | rename |
| `src/strings/activity.ts:activityCopy.changesStartInReviewEditingADate` | `src/strings/activity.ts:activityCopy.changesStartReviewDetail` | rename |
| `src/strings/activity.ts:activityCopy.monthsWithTransactionsPlusTheCurrentMonth` | `src/strings/activity.ts:activityCopy.monthsTransactionsPlusText` | rename |
| `src/strings/activity.ts:activityCopy.message95` | `src/strings/activity.ts:activityCopy.reviewMerchantCaption` | rename |
| `src/strings/activity.ts:activityCopy.rulesAffectFutureUnreviewedImports` | `src/strings/activity.ts:activityCopy.rulesAffectFutureSummary` | rename |
| `src/strings/activity.ts:activityCopy.rulesAffectFutureUnreviewedImportsMoneyIn` | `src/strings/activity.ts:activityCopy.rulesAffectFutureDetail` | rename |
| `src/strings/activity.ts:activityCopy.separator5` | Removed | punctuation |
| `src/strings/activity.ts:activityCopy.noRememberedMerchantsYetAddOneDuring` | `src/strings/activity.ts:activityCopy.noRememberedMerchantsText` | rename |
| `src/strings/activity.ts:activityCopy.matchThisMerchantDirectionAndCompatibleType` | Removed | unused |
| `src/strings/activity.ts:activityCopy.stillNeedReviewPreviewOnlyThisEdit` | Removed | unused |
| `src/strings/activity.ts:activityCopy.splitAmountsMustAddUpExactlyTo2` | `src/strings/activity.ts:activityCopy.splitAmountsMustAddUpExDetail` | rename |
| `src/strings/activity.ts:activityCopy.detailsUpdatedCheckTheSaveStatusBefore` | `src/strings/activity.ts:activityCopy.detailsUpdatedCheckText` | rename |
| `src/strings/glossary.ts:glossary.personal` | Removed | unused |
| `src/strings/glossary.ts:glossary.example` | Removed | unused |
| `src/strings/glossary.ts:glossary.moneyIn` | Removed | unused |
| `src/strings/glossary.ts:glossary.moneyOut` | Removed | unused |
| `src/strings/glossary.ts:glossary.type` | Removed | unused |
| `src/strings/glossary.ts:glossary.linkPhone` | Removed | unused |
| `src/strings/glossary.ts:glossary.connectBank` | Removed | unused |
| `src/strings/glossary.ts:glossary.refresh` | Removed | unused |
| `src/strings/glossary.ts:glossary.completeMonth` | Removed | unused |
| `src/strings/glossary.ts:glossary.headroom` | Removed | unused |
| `src/strings/glossary.ts:glossary.baseline` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.separator` | Removed | punctuation |
| `src/strings/tools.ts:toolsCopy.recurringPaymentsRefundsAndDatedForecasts` | `src/strings/tools.ts:toolsCopy.recurringPaymentsRefundSummary` | rename |
| `src/strings/tools.ts:toolsCopy.confirmedSchedulesForTheNext60Days` | `src/strings/tools.ts:toolsCopy.billsWindowSummary` | rename |
| `src/strings/tools.ts:toolsCopy.confirmedSchedulesForTheNext60Days2` | `src/strings/tools.ts:toolsCopy.billsWindowDetail` | rename |
| `src/strings/tools.ts:toolsCopy.noConfirmedBillsOrRefundsAddSchedules` | `src/strings/tools.ts:toolsCopy.noConfirmedBillsText` | rename |
| `src/strings/tools.ts:toolsCopy.separator2` | Removed | punctuation |
| `src/strings/tools.ts:toolsCopy.separator3` | Removed | punctuation |
| `src/strings/tools.ts:toolsCopy.recordingInstructionsDoesNotCancelAPayment` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.suggestionsUseAtLeastThreeReviewedSource` | `src/strings/tools.ts:toolsCopy.suggestionsUseAtDetail` | rename |
| `src/strings/tools.ts:toolsCopy.noRepeatedPatternFoundInReviewedTransactions` | `src/strings/tools.ts:toolsCopy.noRepeatedPatternText` | rename |
| `src/strings/tools.ts:toolsCopy.expectedRefundsStaySeparateFromIncomeAnd` | `src/strings/tools.ts:toolsCopy.expectedRefundsStayDetail` | rename |
| `src/strings/tools.ts:toolsCopy.chooseSpendableAccountBalancesOnRecordedDates` | `src/strings/tools.ts:toolsCopy.forecastBalanceSummary` | rename |
| `src/strings/tools.ts:toolsCopy.chooseSpendableAccountBalancesOnRecordedDates2` | `src/strings/tools.ts:toolsCopy.forecastBalanceDetail` | rename |
| `src/strings/tools.ts:toolsCopy.additionalPensionTakeHomeCostToReserve` | `src/strings/tools.ts:toolsCopy.additionalPensionTakeLabel` | rename |
| `src/strings/tools.ts:toolsCopy.reservesAreAOneTimeHoldFor2` | `src/strings/tools.ts:toolsCopy.forecastReserveDetail` | rename |
| `src/strings/tools.ts:toolsCopy.separator4` | Removed | punctuation |
| `src/strings/tools.ts:toolsCopy.reservedCashIncludingOverduePayments` | `src/strings/tools.ts:toolsCopy.reservedCashIncludingLabel` | rename |
| `src/strings/tools.ts:toolsCopy.overduePaymentHoldWithinReserves` | `src/strings/tools.ts:toolsCopy.overduePaymentHoldLabel` | rename |
| `src/strings/tools.ts:toolsCopy.lowestModelledBalanceAfterReserves` | `src/strings/tools.ts:toolsCopy.lowestModelledBalanceLabel` | rename |
| `src/strings/tools.ts:toolsCopy.variableAmountForecastUsesEstimate` | `src/strings/tools.ts:toolsCopy.variableAmountForecastLabel` | rename |
| `src/strings/tools.ts:toolsCopy.cancellationInstructionsNothingIsCancelledAutomatically` | `src/strings/tools.ts:toolsCopy.cancellationInstructionLabel` | rename |
| `src/strings/tools.ts:toolsCopy.iConfirmThisScheduleAndNextPayment` | `src/strings/tools.ts:toolsCopy.iConfirmScheduleLabel` | rename |
| `src/strings/tools.ts:toolsCopy.changingTheFirstDateChangesFutureRecurrence` | `src/strings/tools.ts:toolsCopy.changingFirstDateSummary` | rename |
| `src/strings/tools.ts:toolsCopy.changingTheFirstDateChangesFutureRecurrence2` | `src/strings/tools.ts:toolsCopy.changingFirstDateDetail` | rename |
| `src/strings/tools.ts:toolsCopy.chooseTheOriginalReviewedPurchase` | `src/strings/tools.ts:toolsCopy.chooseOriginalReviewedText` | rename |
| `src/strings/tools.ts:toolsCopy.searchPurchasesByMerchantOrDate` | `src/strings/tools.ts:toolsCopy.searchPurchasesMerchantLabel` | rename |
| `src/strings/tools.ts:toolsCopy.chooseOneReviewedBookedEntryToSettle` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.due2` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.confirmTheAccountDirectionAndDateAgainst` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.searchBookedEntriesByMerchantOrDate` | `src/strings/tools.ts:toolsCopy.searchBookedEntriesLabel` | rename |
| `src/strings/tools.ts:toolsCopy.showingUpTo100MatchesWithin35` | `src/strings/tools.ts:toolsCopy.showingUpTo100MatchesWiDetail` | rename |
| `src/strings/tools.ts:toolsCopy.categoriesPaydayPeriodsDailyAllowanceAndRollover` | `src/strings/tools.ts:toolsCopy.categoriesPaydayPeriodsSummary` | rename |
| `src/strings/tools.ts:toolsCopy.actualSpendingUsesIncludedAccountsReviewedPurchases` | `src/strings/tools.ts:toolsCopy.budgetSpendingSummary` | rename |
| `src/strings/tools.ts:toolsCopy.actualSpendingUsesIncludedAccountsReviewedPurchases2` | `src/strings/tools.ts:toolsCopy.budgetSpendingDetail` | rename |
| `src/strings/tools.ts:toolsCopy.changingThisAffectsNewBudgetsExistingBudgets` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.noBudgetsYetSetYourPaydayCalendar` | `src/strings/tools.ts:toolsCopy.noBudgetsYetText` | rename |
| `src/strings/tools.ts:toolsCopy.to` | Removed | fragment |
| `src/strings/tools.ts:toolsCopy.of` | Removed | fragment |
| `src/strings/tools.ts:toolsCopy.sameElapsedDaysOfPreviousPeriod` | `src/strings/tools.ts:toolsCopy.sameElapsedDaysLabel` | rename |
| `src/strings/tools.ts:toolsCopy.allowanceDividesPositiveRemainingBudgetByDays` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.remaining2` | `src/strings/tools.ts:toolsCopy.remainingText` | rename |
| `src/strings/tools.ts:toolsCopy.closedPeriodBalancesOnRecordedDatesRemain` | `src/strings/tools.ts:toolsCopy.closedPeriodBalancesDetail` | rename |
| `src/strings/tools.ts:toolsCopy.monthlyDatesClampToTheLastDay2` | `src/strings/tools.ts:toolsCopy.monthlyDatesClampToTheLDetail` | rename |
| `src/strings/tools.ts:toolsCopy.namesRemainStableToPreserveHistoricalTransactions` | `src/strings/tools.ts:toolsCopy.namesRemainStableDetail` | rename |
| `src/strings/tools.ts:toolsCopy.aMidPeriodStartReceivesAFull2` | `src/strings/tools.ts:toolsCopy.aMidPeriodStartReceivesDetail` | rename |
| `src/strings/tools.ts:toolsCopy.confirmedSchemeTermsEmployerMatchingAndScenarios` | `src/strings/tools.ts:toolsCopy.confirmedSchemeTermsSummary` | rename |
| `src/strings/tools.ts:toolsCopy.recordEachEmploymentAndSchemeVersionSeparately` | `src/strings/tools.ts:toolsCopy.schemeEvidenceSummary` | rename |
| `src/strings/tools.ts:toolsCopy.recordEachEmploymentAndSchemeVersionSeparately2` | `src/strings/tools.ts:toolsCopy.schemeEvidenceDetail` | rename |
| `src/strings/tools.ts:toolsCopy.addConfirmedSchemeTermsToCompareYour` | `src/strings/tools.ts:toolsCopy.addConfirmedSchemeDetail` | rename |
| `src/strings/tools.ts:toolsCopy.of2` | Removed | fragment |
| `src/strings/tools.ts:toolsCopy.genuineEmployerFundingPerPeriod` | `src/strings/tools.ts:toolsCopy.genuineEmployerFundingLabel` | rename |
| `src/strings/tools.ts:toolsCopy.salaryGivenUpThroughSacrificeRemainsEmployee` | `src/strings/tools.ts:toolsCopy.salaryGivenUpText` | rename |
| `src/strings/tools.ts:toolsCopy.employeeFundedMonthlyEquivalent` | `src/strings/tools.ts:toolsCopy.employeeFundedMonthlyLabel` | rename |
| `src/strings/tools.ts:toolsCopy.employerFundedMonthlyEquivalent` | `src/strings/tools.ts:toolsCopy.employerFundedMonthlyLabel` | rename |
| `src/strings/tools.ts:toolsCopy.unknown2` | `src/strings/tools.ts:toolsCopy.unknownText` | rename |
| `src/strings/tools.ts:toolsCopy.separator5` | Removed | punctuation |
| `src/strings/tools.ts:toolsCopy.annualRunRatePlusRecordedOneOff` | `src/strings/tools.ts:toolsCopy.annualRunRateLabel` | rename |
| `src/strings/tools.ts:toolsCopy.annualRunRateAssumesUnchangedPayTerms` | `src/strings/tools.ts:toolsCopy.annualRunRateText` | rename |
| `src/strings/tools.ts:toolsCopy.reliefAtSourceElectionsAreGrossIncluding` | `src/strings/tools.ts:toolsCopy.reliefAtSourceSummary` | rename |
| `src/strings/tools.ts:toolsCopy.reliefAtSourceElectionsAreGrossIncluding2` | `src/strings/tools.ts:toolsCopy.reliefAtSourceDetail` | rename |
| `src/strings/tools.ts:toolsCopy.extraEmployerFundingPerPayPeriod` | `src/strings/tools.ts:toolsCopy.extraEmployerFundingLabel` | rename |
| `src/strings/tools.ts:toolsCopy.estimatedMonthlyTakeHomeCostChange` | `src/strings/tools.ts:toolsCopy.estimatedMonthlyTakeLabel` | rename |
| `src/strings/tools.ts:toolsCopy.at` | Removed | fragment |
| `src/strings/tools.ts:toolsCopy.aHighestModelledRateNeedsAConfirmed` | `src/strings/tools.ts:toolsCopy.highestModelledRateDetail` | rename |
| `src/strings/tools.ts:toolsCopy.confirmedPensionablePayPerPayPeriod` | `src/strings/tools.ts:toolsCopy.confirmedPensionablePayLabel` | rename |
| `src/strings/tools.ts:toolsCopy.forQualifyingEarningsEnterTheConfirmedBanded` | `src/strings/tools.ts:toolsCopy.qualifyingEarningsEnterDetail` | rename |
| `src/strings/tools.ts:toolsCopy.text12Monthly13FourWeekly26Fortnightly` | `src/strings/tools.ts:toolsCopy.text12Monthly13FourWeekText` | rename |
| `src/strings/tools.ts:toolsCopy.schemeEvidenceAndConfirmationNotes` | `src/strings/tools.ts:toolsCopy.schemeEvidenceConfirmatLabel` | rename |
| `src/strings/tools.ts:toolsCopy.schemeTermsVerifiedAgainstEvidence` | `src/strings/tools.ts:toolsCopy.schemeTermsVerifiedLabel` | rename |
| `src/strings/tools.ts:toolsCopy.eligibleForTheRecordedEmployerMatching` | `src/strings/tools.ts:toolsCopy.eligibleRecordedEmployeLabel` | rename |
| `src/strings/tools.ts:toolsCopy.employerBaseOfTheSamePensionablePay` | `src/strings/tools.ts:toolsCopy.employerBaseSameLabel` | rename |
| `src/strings/tools.ts:toolsCopy.fixedEmployerPaymentPerPayPeriod` | `src/strings/tools.ts:toolsCopy.fixedEmployerPaymentLabel` | rename |
| `src/strings/tools.ts:toolsCopy.additionalEmployerBenefitPerPayPeriod` | `src/strings/tools.ts:toolsCopy.additionalEmployerBenefLabel` | rename |
| `src/strings/tools.ts:toolsCopy.matchingTiersUpperEmployeeMatch` | `src/strings/tools.ts:toolsCopy.matchingTiersUpperLabel` | rename |
| `src/strings/tools.ts:toolsCopy.forOneForOneMatchingUpTo2` | `src/strings/tools.ts:toolsCopy.matchingTiersDetail` | rename |
| `src/strings/tools.ts:toolsCopy.observedPayPeriodGrossFundingKnown` | `src/strings/tools.ts:toolsCopy.observedPayPeriodLabel` | rename |
| `src/strings/tools.ts:toolsCopy.observedEmployeeFundedGrossThisPayPeriod` | `src/strings/tools.ts:toolsCopy.observedEmployeeFundedLabel` | rename |
| `src/strings/tools.ts:toolsCopy.observedGenuineEmployerFundingThisPayPeriod` | `src/strings/tools.ts:toolsCopy.observedGenuineEmployerLabel` | rename |
| `src/strings/tools.ts:toolsCopy.recordedGenuineEmployerFundedYTD` | `src/strings/tools.ts:toolsCopy.recordedGenuineEmployerLabel` | rename |
| `src/strings/tools.ts:toolsCopy.recordedGrossOneOffFundingThisTax` | `src/strings/tools.ts:toolsCopy.recordedGrossOneLabel` | rename |
| `src/strings/tools.ts:toolsCopy.keepPayrollSacrificeSeparateFromGenuineEmployer` | `src/strings/tools.ts:toolsCopy.keepPayrollSacrificeSummary` | rename |
| `src/strings/tools.ts:toolsCopy.keepPayrollSacrificeSeparateFromGenuineEmployer2` | `src/strings/tools.ts:toolsCopy.keepPayrollSacrificeDetail` | rename |
| `src/strings/tools.ts:toolsCopy.incrementalTakeHomeCostConfirmedByPayroll` | `src/strings/tools.ts:toolsCopy.incrementalTakeHomeLabel` | rename |
| `src/strings/tools.ts:toolsCopy.takeHomeCostPer100GrossContribution` | `src/strings/tools.ts:toolsCopy.takeHomeCostLabel` | rename |
| `src/strings/tools.ts:toolsCopy.useAPayrollConfirmedIncrementalFactorFor` | `src/strings/tools.ts:toolsCopy.useAPayrollConfirmedSummary` | rename |
| `src/strings/tools.ts:toolsCopy.useAPayrollConfirmedIncrementalFactorFor2` | `src/strings/tools.ts:toolsCopy.useAPayrollConfirmedDetail` | rename |
| `src/strings/tools.ts:toolsCopy.maximumRateIndependentlyVerified` | `src/strings/tools.ts:toolsCopy.maximumRateIndependentlLabel` | rename |
| `src/strings/tools.ts:toolsCopy.verifiedContributionRateCeiling` | `src/strings/tools.ts:toolsCopy.verifiedContributionRatLabel` | rename |
| `src/strings/tools.ts:toolsCopy.allPensionsAllowancesAndEarningsLimitsChecked` | `src/strings/tools.ts:toolsCopy.allPensionsAllowancesLabel` | rename |
| `src/strings/tools.ts:toolsCopy.salarySacrificeEligibilityAndMinimumPayChecked` | `src/strings/tools.ts:toolsCopy.salarySacrificeEligibilLabel` | rename |
| `src/strings/tools.ts:toolsCopy.minimumMonthlyHouseholdHeadroom` | `src/strings/tools.ts:toolsCopy.minimumMonthlyHouseholdLabel` | rename |
| `src/strings/tools.ts:toolsCopy.noMaximumIsInferredFromAnIncomplete` | `src/strings/tools.ts:toolsCopy.pensionCeilingSummary` | rename |
| `src/strings/tools.ts:toolsCopy.noMaximumIsInferredFromAnIncomplete2` | `src/strings/tools.ts:toolsCopy.pensionCeilingDetail` | rename |
| `src/strings/tools.ts:toolsCopy.jSONBackupRemainsTheFullRecoveryFormat` | `src/strings/tools.ts:toolsCopy.csvRecoveryHelp` | rename |
| `src/strings/tools.ts:toolsCopy.balancesShowMoneyOnRecordedDatesSeparate` | `src/strings/tools.ts:toolsCopy.balancesShowMoneyDetail` | rename |
| `src/strings/tools.ts:toolsCopy.selectAnAccountAboveToRecordIts` | `src/strings/tools.ts:toolsCopy.selectAccountAboveDetail` | rename |
| `src/strings/tools.ts:toolsCopy.balanceRecordedPlanningCashHasNotBeen` | `src/strings/tools.ts:toolsCopy.balanceRecordedPlanningText` | rename |
| `src/strings/tools.ts:toolsCopy.mapExactColumnHeadingsAmountsUsePounds` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.singleAmountColumnUsesNegativeDebits` | `src/strings/tools.ts:toolsCopy.singleAmountColumnLabel` | rename |
| `src/strings/tools.ts:toolsCopy.exportCategoryOptionalExactName` | `src/strings/tools.ts:toolsCopy.exportCategoryOptionalLabel` | rename |
| `src/strings/tools.ts:toolsCopy.rollBackImport2` | `src/strings/tools.ts:toolsCopy.rollbackConfirmTitle` | rename |
| `src/strings/tools.ts:toolsCopy.thisRemovesTheImportSTransactionsAnd` | `src/strings/tools.ts:toolsCopy.rollbackConfirmBody` | rename |
| `src/strings/tools.ts:toolsCopy.importedRowsAndTheirAnnotationsRemoved` | `src/strings/tools.ts:toolsCopy.rollbackReceipt` | rename |
| `src/strings/tools.ts:toolsCopy.bookedGBPTransactionsOnlyPendingItemsAutomatic` | Removed | unused |
| `src/strings/move.ts:moveCopy.englandNorthernIrelandResidentialPlanningOnlyConfirm` | `src/strings/move.ts:moveCopy.englandNorthernIrelandDetail` | rename |
| `src/strings/move.ts:moveCopy.newPlansStartWithZeroPropertyAnd` | `src/strings/move.ts:moveCopy.newPlanSummary` | rename |
| `src/strings/move.ts:moveCopy.newPlansStartWithZeroPropertyAnd2` | `src/strings/move.ts:moveCopy.newPlanDetail` | rename |
| `src/strings/move.ts:moveCopy.thisReplacesYourMoveAssumptionsWithExample` | `src/strings/move.ts:moveCopy.replacesMoveAssumptionsText` | rename |
| `src/strings/move.ts:moveCopy.reviewAndConfirmTheMoveAssumptions` | `src/strings/move.ts:moveCopy.reviewConfirmMoveText` | rename |
| `src/strings/move.ts:moveCopy.exampleTemplateReplaceExampleValues` | `src/strings/move.ts:moveCopy.exampleTemplateReplaceText` | rename |
| `src/strings/move.ts:moveCopy.previouslySavedInputsCheckTheirSource` | `src/strings/move.ts:moveCopy.previouslySavedInputsText` | rename |
| `src/strings/move.ts:moveCopy.separator` | Removed | punctuation |
| `src/strings/move.ts:moveCopy.mortgageRedemptionExcludingSeparateExitCharge` | `src/strings/move.ts:moveCopy.mortgageRedemptionExcluLabel` | rename |
| `src/strings/move.ts:moveCopy.validEditsSaveAutomaticallyAndRequireMove` | `src/strings/move.ts:moveCopy.autosaveHelp` | rename |
| `src/strings/move.ts:moveCopy.firstTimeBuyerEligibilityAndAdditionalProperty` | `src/strings/move.ts:moveCopy.buyerEligibilityHelp` | rename |
| `src/strings/move.ts:moveCopy.nonResidentSDLTSurchargeApplies` | `src/strings/move.ts:moveCopy.nonResidentSDLTSurchargLabel` | rename |
| `src/strings/move.ts:moveCopy.provisionalConfirmTheAssumptions` | `src/strings/move.ts:moveCopy.provisionalConfirmAssumText` | rename |
| `src/strings/move.ts:moveCopy.ifRatesRiseBy2` | `src/strings/move.ts:moveCopy.rateStressLabel` | rename |
| `src/strings/move.ts:moveCopy.exchangeDeposit2` | `src/strings/move.ts:moveCopy.exchangeDepositLabel` | rename |
| `src/strings/move.ts:moveCopy.exchangeCashGapBeforeChainDeposit` | `src/strings/move.ts:moveCopy.exchangeCashGapLabel` | rename |
| `src/strings/move.ts:moveCopy.saleEquityMayArriveTooLateTo2` | `src/strings/move.ts:moveCopy.exchangeTimingDetail` | rename |
| `src/strings/move.ts:moveCopy.currentHousingAlreadyIncludedInEssentials` | `src/strings/move.ts:moveCopy.currentHousingAlreadyText` | rename |
| `src/strings/move.ts:moveCopy.monthsOfOverlappingOldAndNewPayments` | `src/strings/move.ts:moveCopy.monthsOverlappingOldLabel` | rename |
| `src/strings/move.ts:moveCopy.myCurrentHousingAmountIsIncludedIn` | `src/strings/move.ts:moveCopy.myCurrentHousingLabel` | rename |
| `src/strings/move.ts:moveCopy.confirmTheMonthlyBaselineMoveAssumptionsAnd` | `src/strings/move.ts:moveCopy.confirmMonthlyBaselineDetail` | rename |
| `src/strings/move.ts:moveCopy.monthlyHeadroomAfterOverlapEnds` | `src/strings/move.ts:moveCopy.monthlyHeadroomAfterLabel` | rename |
| `src/strings/move.ts:moveCopy.message84` | `src/strings/move.ts:moveCopy.scenarioHeadroomLabel` | rename |
| `src/strings/move.ts:moveCopy.totalOldHousingPaymentsDuringOverlap` | `src/strings/move.ts:moveCopy.totalOldHousingLabel` | rename |
| `src/strings/move.ts:moveCopy.mortgageRedemptionIsTheLoanBalancePaid` | `src/strings/move.ts:moveCopy.redemptionSummary` | rename |
| `src/strings/move.ts:moveCopy.mortgageRedemptionIsTheLoanBalancePaid2` | `src/strings/move.ts:moveCopy.redemptionDetail` | rename |
| `src/strings/move.ts:moveCopy.separator2` | Removed | punctuation |
| `src/strings/move.ts:moveCopy.replaceItsSavedAssumptionsWithTheCurrent` | `src/strings/move.ts:moveCopy.scenarioUpdateBody` | rename |
| `src/strings/move.ts:moveCopy.update2` | `src/strings/move.ts:moveCopy.updateText` | rename |
| `src/strings/move.ts:moveCopy.load2` | `src/strings/move.ts:moveCopy.loadText` | rename |
| `src/strings/move.ts:moveCopy.thisReplacesCurrentMoveInputsSaveThem` | `src/strings/move.ts:moveCopy.scenarioLoadBody` | rename |
| `src/strings/move.ts:moveCopy.undoIsAvailableUntilTheScenarioList` | `src/strings/move.ts:moveCopy.undoAvailableUntilText` | rename |
| `src/strings/move.ts:moveCopy.separator3` | Removed | punctuation |
| `src/strings/move.ts:moveCopy.secondSelectedMinusFirstSelected` | `src/strings/move.ts:moveCopy.secondSelectedMinusText` | rename |
| `src/strings/move.ts:moveCopy.negativePaymentGapDifferencesMeanLowerCosts` | `src/strings/move.ts:moveCopy.negativePaymentGapDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.couldnTCheckYourConnectionDetailsBelow` | `src/strings/accounts.ts:accountsCopy.couldnTCheckConnectionText` | rename |
| `src/strings/accounts.ts:accountsCopy.message6` | `src/strings/accounts.ts:accountsCopy.connectionError` | rename |
| `src/strings/accounts.ts:accountsCopy.resultsCoverOnlyTheBanksRefreshedThis` | `src/strings/accounts.ts:accountsCopy.resultsCoverBanksText` | rename |
| `src/strings/accounts.ts:accountsCopy.separator` | Removed | punctuation |
| `src/strings/accounts.ts:accountsCopy.unchangedEachBankShowsWhenItsData` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.permissionExpiredReconnectThisBank` | `src/strings/accounts.ts:accountsCopy.permissionExpiredReconnText` | rename |
| `src/strings/accounts.ts:accountsCopy.someDataMayBeUnsupportedOrMissing` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.connectAgainAndCheckTheNewConnection` | `src/strings/accounts.ts:accountsCopy.connectAgainCheckText` | rename |
| `src/strings/accounts.ts:accountsCopy.separator2` | Removed | punctuation |
| `src/strings/accounts.ts:accountsCopy.thisRemovesBankPermissionAndDeletesDownloaded` | `src/strings/accounts.ts:accountsCopy.disconnectConfirmBody` | rename |
| `src/strings/accounts.ts:accountsCopy.disconnect2` | `src/strings/accounts.ts:accountsCopy.disconnectAction` | rename |
| `src/strings/accounts.ts:accountsCopy.someTransactionsMayBeMissingSeeWarnings` | `src/strings/accounts.ts:accountsCopy.someTransactionsMayText` | rename |
| `src/strings/accounts.ts:accountsCopy.refreshFailedYourEarlierDataIsUnchanged` | `src/strings/accounts.ts:accountsCopy.refreshFailedEarlierText` | rename |
| `src/strings/accounts.ts:accountsCopy.supportDependsOnYourExactAccountOr` | `src/strings/accounts.ts:accountsCopy.supportDependsExactText` | rename |
| `src/strings/accounts.ts:accountsCopy.separator3` | Removed | punctuation |
| `src/strings/accounts.ts:accountsCopy.of5` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.enableBankingGivesHeadroomPermissionToRead` | `src/strings/accounts.ts:accountsCopy.enableBankingGivesDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.createAnEnableBankingAccountThenRegister` | `src/strings/accounts.ts:accountsCopy.createEnableBankingDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.forRealAccountsActivateProductionAccessAnd` | `src/strings/accounts.ts:accountsCopy.realAccountsActivateSummary` | rename |
| `src/strings/accounts.ts:accountsCopy.forRealAccountsActivateProductionAccessAnd2` | `src/strings/accounts.ts:accountsCopy.realAccountsActivateDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.headroomCurrentlyNeedsAnOwnerManagedHTTPS` | `src/strings/accounts.ts:accountsCopy.serverOwnerSummary` | rename |
| `src/strings/accounts.ts:accountsCopy.headroomCurrentlyNeedsAnOwnerManagedHTTPS2` | `src/strings/accounts.ts:accountsCopy.serverOwnerDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.ifYouOwnTheServerFollowThe2` | `src/strings/accounts.ts:accountsCopy.serverSetupDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.serverHTTPSAddressCallbackPreviewOnly` | `src/strings/accounts.ts:accountsCopy.serverHTTPSAddressCallbLabel` | rename |
| `src/strings/accounts.ts:accountsCopy.registerThisExactAllowedRedirectURLIn` | `src/strings/accounts.ts:accountsCopy.registerExactAllowedDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.theServerMustVerifyTheApplicationIs` | `src/strings/accounts.ts:accountsCopy.applicationCheckSummary` | rename |
| `src/strings/accounts.ts:accountsCopy.theServerMustVerifyTheApplicationIs2` | `src/strings/accounts.ts:accountsCopy.applicationCheckDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.onTheServerItsOwnerRunsThe2` | `src/strings/accounts.ts:accountsCopy.pairingLinkDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.findYourExactBankAndAccountProduct` | `src/strings/accounts.ts:accountsCopy.findExactBankSummary` | rename |
| `src/strings/accounts.ts:accountsCopy.findYourExactBankAndAccountProduct2` | `src/strings/accounts.ts:accountsCopy.findExactBankDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.bankPermissionHasExpiredConnectTheBank` | `src/strings/accounts.ts:accountsCopy.bankPermissionHasDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.bankCreditCardAndHistoryCoverageDepends` | `src/strings/accounts.ts:accountsCopy.bankCreditCardSummary` | rename |
| `src/strings/accounts.ts:accountsCopy.bankCreditCardAndHistoryCoverageDepends2` | `src/strings/accounts.ts:accountsCopy.bankCreditCardDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.afterBankPermissionIsCheckedRefreshTransactions` | `src/strings/accounts.ts:accountsCopy.afterBankPermissionDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.refreshNeedsAReachableConfiguredServerAnd` | `src/strings/accounts.ts:accountsCopy.refreshNeedsAReachableDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.theCurrentConnectionImportsBookedGBPTransactions` | `src/strings/accounts.ts:accountsCopy.bankImportSummary` | rename |
| `src/strings/accounts.ts:accountsCopy.theCurrentConnectionImportsBookedGBPTransactions2` | `src/strings/accounts.ts:accountsCopy.bankImportDetail` | rename |
| `src/strings/accounts.ts:accountsCopy.separator4` | Removed | punctuation |
| `src/strings/settings.ts:settingsCopy.separator` | Removed | punctuation |
| `src/strings/settings.ts:settingsCopy.appearance` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.coloursAndNavigation` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.useAndroidWallpaperColours` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.wallpaperColoursAreAvailableOnAndroid12` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.reduceMotion` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.theSystemReducedMotionSettingIsAlways` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.showMoveInNavigation` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.privacy` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.controlWhoSeesYourData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.hideSummaryAmounts` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.amountsRemainVisibleInEditableFormFields` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.unlockWithYourPhone` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.hideScreenshotsAndRecentApps` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.screenProtection` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.tryProtectionAgain` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.appLockControlsAccessThroughHeadroomData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.linkThisPhone` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.connectToYourHeadroomServer` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.thisPhoneIsLinkedTo` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.linkThisPhoneToYourHeadroomServer` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.oneUseLinkingCode` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.askTheServerOwnerForALinking` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.phoneLinkedOpenAccountsToConnectA` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.advancedOwnerSetup` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.serverAddressHTTPS` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.serverAccessCode` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.saveConnection` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.theServerAccessCodeLinksThisPhone` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.unlinkThisPhone` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.unlinkThisPhone2` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.thisRemovesThePhoneSAccessCode` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.cancel` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.unlinkPhone` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.phoneUnlinkedBankPermissionIsUnchanged` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.yourData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.manageDataAndExamples` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.showYourData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.tryExampleData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.resetExampleData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.resetExampleData2` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.thisReplacesExampleDataYourExampleEdits` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.resetExamples` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.exampleDataReset` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.restartSetupGuide` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.restartingTheGuideKeepsYourDataExample` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.deleteExampleData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.deleteYourData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.deleteThisData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.message50` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.deleteData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.merchantRules` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.manageTransactionRules` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.backupAndRestore` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.saveOrRestoreYourData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.backupsContainYourFinancialDataInA` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.exportYourBackup` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.personalBackupWrittenToYourChosenFolder` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.exportCancelledNoBackupWasWritten` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.backupShareSheetClosedConfirmYourChosen` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.restoreABackup` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.replaceYourData` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.message63` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.replaceYourData2` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.yourDataIsRestoredAndSavedOn` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.aboutHeadroom` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.aboutTheApp` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.privatePlanningClearerDecisions` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.version` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.gBPOneOwnerPerServer` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.monthlyHeadroomIsABudgetEstimate` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.monthlyHeadroomIsABudgetEstimateYour` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.serverAccessCodesUseSecureStore` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.serverAccessCodesUseSecureStoreAndroidBackup` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.protection` | Removed | unused |
| `src/strings/settings.ts:settingsCopy.enableAppLock` | `src/strings/settingsRework.ts:settingsUI.enableAppLock` | rename |
| `src/strings/settings.ts:settingsCopy.disableAppLock` | `src/strings/settingsRework.ts:settingsUI.disableAppLock` | rename |
| `src/strings/settings.ts:settingsCopy.unlockSubtitle` | `src/strings/settingsRework.ts:settingsUI.unlockSubtitle` | rename |
| `src/strings/settings.ts:settingsCopy.themeLabels` | Removed | unused |
| `src/strings/today.ts:todayCopy.step` | Removed | unused |
| `src/strings/today.ts:todayCopy.of4ProgressSavesOnThisDevice` | Removed | unused |
| `src/strings/today.ts:todayCopy.thisIsNotALiveAccountBalance` | Removed | unused |
| `src/strings/today.ts:todayCopy.endExcluded` | Removed | unused |
| `src/strings/today.ts:todayCopy.left` | Removed | unused |
| `src/strings/today.ts:todayCopy.toReview` | Removed | unused |
| `src/strings/today.ts:todayCopy.lastCompleteBankRefresh` | Removed | unused |
| `src/strings/today.ts:todayCopy.lastAttempt` | Removed | unused |
| `src/strings/today.ts:todayCopy.confirmed` | Removed | unused |
| `src/strings/today.ts:todayCopy.toReviewThisMonth` | Removed | unused |
| `src/strings/today.ts:todayCopy.baseline` | Removed | unused |
| `src/strings/today.ts:todayCopy.allAccountsIncluded` | Removed | unused |
| `src/strings/today.ts:todayCopy.pastMonths` | Removed | unused |
| `src/strings/plan.ts:planCopy.openASectionToDraftChangesThen` | Removed | unused |
| `src/strings/plan.ts:planCopy.whyZero` | Removed | unused |
| `src/strings/plan.ts:planCopy.noMoneyIsMoved` | Removed | unused |
| `src/strings/plan.ts:planCopy.confirmedInActivity` | Removed | unused |
| `src/strings/plan.ts:planCopy.sourceMonth` | Removed | unused |
| `src/strings/plan.ts:planCopy.categories` | Removed | unused |
| `src/strings/activity.ts:activityCopy.unreviewed` | Removed | unused |
| `src/strings/activity.ts:activityCopy.matchingTransactions` | Removed | unused |
| `src/strings/activity.ts:activityCopy.needingReview` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.renewal` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.firstDue` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.cancellationInstructions` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.proposedNextDate` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.evidence` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.ending` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.due` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.excludedAccounts` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.lastCompleteImport` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.defaultCalendar` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.anchored` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.weekends` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.starts` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.endExcluded` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.left` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.elapsed` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.ofAvailableBudgetUsed` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.stillNeedReview` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.payPeriodsYear` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.observedGrossEmployeeRate` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.observedGenuineEmployerRate` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.bothUseTheConfirmedDenominator` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.toAdd` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.accountType` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.ownership` | Removed | unused |
| `src/strings/tools.ts:toolsCopy.csvDates` | Removed | unused |
| `src/strings/move.ts:moveCopy.inputOrigin` | Removed | unused |
| `src/strings/move.ts:moveCopy.taxBasis` | Removed | unused |
| `src/strings/move.ts:moveCopy.rate` | Removed | unused |
| `src/strings/move.ts:moveCopy.yearsOverlap` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.lastVerified` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.finished` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.new` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.updated` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.lastDownloaded` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.returnedLastRetrieval` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.step` | Removed | unused |
| `src/strings/accounts.ts:accountsCopy.connection` | Removed | unused |
| `src/strings/settingsRework.ts:settingsUI.on` | Removed | fragment |

## Output parity

The check was built and run before cleanup: base e4ce04d, 1,311 output entries, zero removals, zero failures. After cleanup: 1,099 retained output entries unchanged, 212 explicitly accounted removals, 50 complete text elements merged, zero failures. Functions are called with fixed zero, singular and plural samples; string-only adapters receive a fixed month sample. The script loads every strings module at the base and current head. It compares each retained or renamed output and every merged result, rejects unaccounted new outputs, and checks merged literal parts against the base values.

The brief's raw multiset exception list conflicts with its required deletion of unused and duplicate keys. The manifest explicitly accounts for those deletions as well as punctuation and fragment removal. This is an accounting adjustment, not permission to alter retained copy. No wording changed in this workstream. Run `node scripts/check-copy-parity.cjs` on this workstream's head to reproduce it; later intentional wording workstreams should pass this workstream's commit as the script's head argument.

## Verification

Baseline: typecheck passed; 245 tests passed with host access; Android export passed with host access. The sandbox test attempt failed on localhost and temporary-file permissions, not assertions.

Not run: device, emulator, TalkBack, font scale, live bank connection, deployed server or backup restore on Android.

Workstream 1: typecheck passed, 245 tests passed, Android export passed. Metro emitted a NO_COLOR/FORCE_COLOR environment warning.

Workstream 2: typecheck passed, 248 tests passed, Android export passed. One-off extraction preserved all 172 existing exact keys and their entry-point precedence in the regression fixture.

Workstream 3: typecheck passed, 248 tests passed, Android export passed with EXPO_OFFLINE=1 after a stalled network-enabled export was stopped. No dependency or export-script change.

Workstream 4: typecheck passed, 249 tests passed, Android export passed. Parity passed with 1,099 retained outputs, 212 explicit removals, 50 merged elements and no failures.

Workstream 5: typecheck passed, 250 tests passed, Android export passed. A loaded run exceeded the default five-second timeout in the TypeScript reference scan; that test now has a 15-second timeout with unchanged assertions. No device checks were run.
