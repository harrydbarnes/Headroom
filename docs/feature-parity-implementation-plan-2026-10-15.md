# Headroom: Snoop/Emma parity and pension implementation plan

Prepared 15 October 2026. Planning baseline: Headroom source 0.2.3. This is a proposed delivery roadmap, not a claim that the features below exist. It preserves the existing Move, headroom, goals, debt and private/manual workflows.

Implementation update, 16 October: priorities 0-1 now have source implementation. See [delivery evidence and remaining release gates](priority-0-1-delivery-2026-10-16.md). Native acceptance and dependency remediation remain open.

## Product outcome and scope

Deliver a daily money-management app with category/payday budgeting, account balances, recurring bills, meaningful analysis and proactive reminders, plus an evidence-based workplace-pension optimiser. Include the wider Snoop/Emma ecosystem in the roadmap rather than silently dropping features that need commercial partners.

Android and UK/GBP are first. Continue local/offline planning and the owner-controlled server option; introduce a managed connection path so ordinary users do not need API keys or their own server. Web, collaboration, other currencies and partner services follow the core tracking release. Competitor feature tiers and provider availability must be rechecked when each batch starts.

Reference baselines: [Snoop feature matrix](https://www.snoop.app/plus/), [Emma budgeting](https://emma-app.com/features/tracking/budgeting), [Emma plan matrix](https://help.emma-app.com/en/article/what-are-the-features-of-emma-plus-pro-and-ultimate-678fjp/), [Emma shared Spaces](https://help.emma-app.com/en-us/article/emma-spaces-137vijy/), [Emma transaction splits](https://help.emma-app.com/en/article/split-a-transaction-1jytjas/).

## Ordered delivery batches

| Batch | Deliverable | Dependencies | Completion gate |
| --- | --- | --- | --- |
| 0 | Establish release baseline and domain migrations | Existing 0.2.3 | Installable Android build, real-device regression results, reversible schema migration/restore fixtures and agreed parity inventory |
| 1 | Account ledger and data portability | 0 | Balances, transactions and imports reconcile without duplicates; existing data preserved; CSV roundtrip/import preview passes |
| 2 | Real budgets and pension contribution core | 1 for budgets; 0 for pension core | Payday/category budgets handle corrections and rollover; confirmed pension terms produce correct matching scenarios |
| 3 | Bills, subscriptions and cash-flow forecast | 1–2 | Confirmed recurring rules produce explainable forecasts without duplicating booked/pending payments |
| 4 | Payslip and pension-document analysis | Pension core plus encrypted document storage | Extracted fields require review; payslip/scheme/provider evidence reconcile; no invented match terms or silent payroll changes |
| 5 | Insights, automation and alerts | 1–4 | Useful recurring reports and timely, deduplicated opt-in notifications; stale/partial data never imply certainty |
| 6 | Net worth, retirement and goal projections | 1, pension core; 4 for document-backed figures | Assets/liabilities and restricted pension wealth stay distinct from spendable cash; transparent dated projections |
| 7 | Household collaboration, managed onboarding and web | Stable ledger; identity/sync foundation starts in 1 | Separate users/devices, explicit permissions, conflict handling, deletion and recovery verified end to end |
| 8 | Optional partner ecosystem | Core release plus approved providers | Real provider agreements, appropriate permissions, clear fees and live integration/recovery proof |

While device access is unavailable, domain implementation and fixtures can proceed; native release verification remains open. Batches 1–3 form the core tracking milestone. Pension core starts alongside batch 2 rather than waiting for every tracking feature. Batch 4 makes it document-assisted. Batches 5–7 broaden everyday parity; batch 8 covers features that require external businesses and services.

### Batch 0 — Release baseline and migration design

- Produce and install the Android development/preview build. Execute the P1–P3 matrix: migrations, restore, privacy, TalkBack, large text, keyboard, compact/landscape/tablet and consent flows.
- Recheck unresolved dependency advisories and fix compatible upstream updates before distribution.
- Record each parity feature as planned, implemented, device-tested and live-provider-tested. Feature presence alone is not parity proof.
- Define stable identifiers, integer-pence amounts, dates/time zones, provenance, undo/audit history and versioned migrations. Retain old backup importers and preserve source fields.
- Establish a maintainable authentication/owner boundary for future managed onboarding and shared workspaces without immediately exposing the current single-owner server to multiple users.

### Batch 1 — Financial data foundation

- First-class accounts: cash, current, savings, credit card, loan, mortgage, investment and pension; ownership group, institution, currency, included/excluded budget scope and archived status.
- Balance snapshots with available/current distinction, liability sign conventions, provider timestamps and stale/unknown states. No summing incompatible balances or treating credit limits as cash.
- Keep booked transactions immutable at source. Add local annotations and derived splits; model pending items separately where supported and reconcile pending-to-booked identities.
- CSV import with reusable column mapping, debit/credit/date/decimal checks, account selection, duplicate preview, import receipt and rollback. CSV export with account/date/category filters; retain JSON recovery backups.
- Cross-date search, amount ranges, notes, tags, custom merchant aliases and receipt attachment metadata. Child transaction splits must sum exactly to their parent and must not duplicate ledger totals.
- Create a provider-capability matrix. Show unsupported balances/accounts and history limits rather than reporting them as zero or complete.

### Batch 2A — Budgets that work during the month

- User-managed categories/subcategories mapped to the existing Essentials, Flexible and Annual groups. Archive categories without losing history.
- Overall, category and merchant budgets; weekly, fortnightly, four-weekly, monthly and chosen-payday periods. Handle month-end paydays, weekends, leap years and changing pay dates explicitly.
- Spent, remaining, days left, daily allowance and comparable-period progress. Separate actual spending from upcoming commitments and planned transfers.
- Optional positive/negative rollover with a visible period ledger. Later corrections create auditable adjustments/recalculation, not silent historical inconsistencies.
- Suggested starting budgets from sufficiently covered history, with preview and acceptance. Preserve manual budgeting when bank access is absent.
- Splits, refunds, reimbursements and transfers flow through budgets consistently. A reimbursement can reduce an expense without being mistaken for salary.

### Batch 2B — Pension contribution and employer-match core

Deliver a useful manual-input version before document automation. Add a Pension area within Plan, with an overview card on Today when a verified opportunity or discrepancy exists.

Capture employer, employment/pay period, basic and pensionable pay, pension type, scheme/version dates, employee election, contribution method, employer base contribution, matching tiers/caps and eligibility. Support multiple employments/schemes and one-off contributions.

For every percentage show its denominator: full/basic salary, contractual reference salary, scheme-defined pensionable earnings or qualifying earnings. Record both the quoted scheme percentage and the observed percentage calculated from confirmed figures. Contribution bases depend on scheme rules, so a generic minimum percentage is not an employer policy. [GOV.UK workplace contributions](https://www.gov.uk/workplace-pensions/what-you-your-employer-and-the-government-pay).

Model fixed employer payments, no matching, one-for-one matching, enhanced/tiered matching, caps and effective dates. Base employer contributions and discretionary extras remain distinct. Salary sacrifice-funded amounts must be separated from the employer's additional benefit, even when payroll/provider records label the entire payment as employer contributions. Handle relief at source, net pay and salary sacrifice separately; tax relief and an employer match are different components. [MoneyHelper tax relief](https://www.moneyhelper.org.uk/en/pensions-and-retirement/tax-and-pensions/tax-relief-and-your-pension).

Outputs:

- Employee-funded amount and percentage; employer-funded amount and percentage; tax relief where applicable; combined pension funding, monthly/annual/YTD.
- Contribution needed to unlock each confirmed matching tier; maximum employer benefit under the scheme; difference from the current election.
- Current / full-match / chosen-extra-contribution scenarios, with estimated take-home change, extra employer funding, annual pension increase and remaining household headroom.
- Confidence and missing-information checklist. Unknown matching stays unknown; a payslip alone does not establish the full matching schedule.
- A user-selectable objective: capture available match, increase saving by a chosen amount, or maximise modelled contribution subject to a minimum cash/headroom floor and verified limits. Do not equate maximising pension saving with maximising overall financial wellbeing.

Illustrative acceptance fixture: confirmed pensionable pay is £4,000/month, employee contributes 4%, and employer matches one-for-one up to 6%. Show current £160 + £160, versus £240 + £240 at 6%: £80 extra employee gross contribution, £80 extra employer funding, £160 extra pension funding/month (£1,920/year). Estimate take-home separately only after the contribution method/tax inputs are confirmed. This is a fictional test, not a claim about Harry's employer.

### Batch 3 — Bills, subscriptions and cash flow

- Suggest recurring bills/income from transactions, with merchant, amount range, frequency, next due date and confidence. Require confirmation and support irregular/annual bills, variable amounts and ended subscriptions.
- Bills calendar/list, price increases, contract renewal dates, cancellation instructions, expected refunds and overdue refund checks. Do not imply the app cancelled a payment without provider confirmation.
- Reconcile scheduled commitments with pending/booked entries once only. Track excluded/unsupported accounts and missed expected income.
- Forecast balances to payday and through upcoming commitments. Show source balances, forecast assumptions, uncertainty and last refresh. Provide planning-only estimates when data is incomplete rather than a definitive safe-to-spend number.
- Integrate annual sinking funds, goal commitments and proposed pension changes with the cash-flow view.

### Batch 4 — Payslip and scheme-document analysis

Import payslip PDFs/photos, pension statements, benefit booklets and scheme/matching schedules. Add manual entry/correction and a reusable employer template. Prefer on-device extraction; external document processing requires explicit opt-in, disclosed processor/retention and a separate permission from bank connection.

Extract into a review screen: pay date/period, pay frequency, gross/basic/taxable/NIable/pensionable pay, variable pay, net pay, tax code/region, tax/NI/student-loan deductions, employee pension deduction or salary sacrifice, employer contribution and YTD totals. Preserve the distinction between period figures, YTD totals and estimates. Minimise retained identifiers such as NI number, payroll ID, address and bank details.

Extract scheme name/type, permitted options, matching formula, caps, pensionable-pay definition, salary-sacrifice availability, employer NI-sharing policy, bonus treatment, fees and relevant dates. Link every accepted term to a document/page/snippet and require confirmation of ambiguous values. Employer benefits/HR documents are the source for available workplace plans; a company name alone is insufficient.

Reconcile three independent evidence layers:

1. Scheme rules: what should be contributed.
2. Payslip: what payroll reports as deducted/contributed.
3. Pension statement/provider: what was actually credited, with timing differences and tax relief separated.

Flag possible mismatch, changed contribution basis, unused match, uncertain method and contributions awaiting provider confirmation. Do not label a missing employer amount on a payslip as a zero employer contribution.

Before storing original payslips, deliver an encrypted document vault, protected keys, redaction, retention/deletion controls and backup inclusion choices. Existing app-private but unencrypted SQLite is not sufficient evidence of an encrypted document workflow. No raw payroll/document content in logs or analytics.

Start with defined-contribution scenarios. Record defined-benefit/hybrid entitlements separately and use pension-input statements for allowance analysis; do not apply DC pot-growth/matching assumptions to DB benefits or recommend surrendering protected rights.

### Pension tax, affordability and projection requirements

- Version calculation rules by tax year and jurisdiction, including Scottish income tax where relevant. Separate present rules from future effective changes; never apply a future rule to today's payslip.
- Model relief at source/net pay/salary sacrifice with rounding and pay-period rules. Higher-rate relief flags must be conditional on method and supplied income evidence, not a blanket claim that tax is owed back.
- Distinguish the relevant-earnings limit on personal tax relief from the annual allowance covering pension inputs. Include employer contributions, other schemes, variable pay and DB input amounts where applicable.
- Standard/reduced allowances, taper, MPAA and carry-forward require complete inputs; carry-forward requires historical eligibility and usage evidence. Suppress any definitive maximum when those facts are missing. [GOV.UK annual allowance](https://www.gov.uk/tax-on-your-private-pension/annual-allowance).
- Implement salary-sacrifice eligibility/minimum-pay constraints and flag potential effects on employment-related benefits or reference pay. Record whether the employer shares NI savings; do not assume it.
- Maintain future-dated rule support, including the published April 2029 salary-sacrifice NIC changes. Recheck legal status, commencement and implementation details before shipping that ruleset. [GOV.UK policy publication](https://www.gov.uk/government/publications/changes-to-salary-sacrifice-for-pensions-from-april-2029).
- Payroll contributions already reduce take-home income: never deduct them again from the household budget. Preview a change in net pay, and apply a baseline change only with explicit user approval. Employer funding is retirement wealth, not spendable monthly income.
- Prioritise visible trade-offs: bills, cash buffer, debt, goals, inaccessible retirement savings and a contribution affordability floor. Show several scenarios and evidence limitations, with no automatic payroll changes or pension transfers.
- Retirement projections later include chosen retirement age, current pots, fees, inflation, contribution growth and multiple return assumptions. Label estimates and separate projected retirement income from present cash.

### Batch 5 — Intelligence and proactive operation

- Category/merchant trends, comparable-period comparisons, unusual charges, duplicate-looking payments, rising bills and goal progress. Insights name the transactions and calculation behind them.
- Category suggestions from explicit rules and explainable merchant history, with uncertain items kept in review. Corrections persist through sync and model updates; AI extraction/classification does not become the authoritative money calculator.
- Weekly/monthly summaries and user-configurable spending, bill, consent, refund and pension-match alerts. Quiet hours, grouped alerts, notification privacy and deep links to the exact action.
- Durable backend jobs for provider-permitted refresh schedules, with per-bank locks, rate limits, idempotency and retries. Android background work is opportunistic; avoid promising exact refresh times. Persist outcome/freshness receipts.
- Pension reminders after pay rises, new employer terms, contribution changes and tax-year transitions; distinguish inferred opportunities from confirmed ones.

### Batch 6 — Net worth and longer-term decisions

- Assets/liabilities, manual valuation and provider-backed balances, mortgages/loans, pensions/investments, source timestamps and historical snapshots.
- Track balances and contributions separately from investment returns. Restricted pensions and estimated property equity never inflate cash available for bills or a move.
- Extend debt payoff schedules, goal scenarios and Move comparisons with actual balance/commitment data while preserving the manual confirmed assumptions.
- Retirement income scenarios, pension fee visibility and employer-plan comparison where genuinely available. Pension consolidation or fund selection remains an explicitly scoped later advisory/partner capability, not an automatic optimisation action.

### Batch 7 — Household, onboarding and access

- Personal/joint/business account groups, separate budgets, shared household views and permission-controlled spaces. Invite/revoke users, show who changed what and prevent one household member seeing unshared accounts/documents.
- Managed bank onboarding with no user-held provider private keys or personal server deployment. Retain the private-server mode as an advanced choice.
- Authenticated multi-device synchronisation, encrypted transport/backups, durable conflict resolution, export/delete and recovery. Define the trust model and offline conflict policy before deploying shared editing.
- Read-only web dashboard first, then web editing parity. Broader currency support requires original-currency records, dated FX rates and clear conversion/rounding rules rather than treating foreign amounts as GBP.
- Help, connection troubleshooting, accessible onboarding and a usable support channel. Widgets/quick actions follow stable daily-budget data and notification privacy settings.

### Batch 8 — Partner-dependent ecosystem parity

Keep each item in the backlog with a named dependency and feature flag:

- Savings accounts/pots, recurring deposits and round-ups: authorised savings/payment providers, account opening/identity checks, product terms and independent savings balances.
- Payments/transfers and shared-expense settlement: a payment provider, strong customer authentication, limits, status receipts, failure recovery and explicit per-payment user intent.
- Investment accounts/trading and automated investing: an appropriate regulated provider, custody, suitability/appropriateness obligations as applicable, costs/risk disclosures and reliable order handling.
- Credit-score display, rent reporting and relevant fraud-monitoring services: bureau/provider contracts, supported jurisdictions and consent/data-quality controls.
- Cashback, bill switching, partner offers and subscription cancellation services: commercial integrations, eligibility, disclosed commissions and confirmed outcomes. Savings claims use a visible comparison basis.
- Pension provider connections and workplace-benefits feeds where available: provider/employer support, consent, document fallback and capability-specific accuracy checks.

These services require integration and commercial/regulatory work in addition to app UI. They can remain optional while the core budgeting/pension-analysis product ships. No payment, payroll election, trade or pension transfer is executed as a side effect of analysis.

## Screen and workflow organisation

Preserve a small number of destinations as features grow:

- Today: account freshness, current-period budget remaining, upcoming bills and a small prioritised action list.
- Activity: transactions, recurring bills/subscriptions, refunds and drill-down spending insights.
- Plan: category/payday budgets, goals/debt and a dedicated Pension section with payslip/terms review and scenario comparison.
- Move: existing detailed property and post-move affordability tools.
- Accounts: balances, ownership groups, assets/liabilities, pension account records and provider connection health.
- Settings: privacy/document retention, notifications, backup/sync, account access and optional partner services.

Put shared-space choice in a workspace selector and preserve the explicit separation of fictional examples. Use contextual explanations and staged setup rather than adding every new input to onboarding.

## Implementation structure

Extend the current React Native/Expo interface and pure TypeScript calculators. Separate domain modules for accounts/ledger, budget periods, categories/splits, recurring payments, forecasts, insights, payroll, pension schemes, matching, tax rules and document evidence. Store dated snapshots and provenance rather than repeatedly overwriting the latest fact.

Key records: Account, BalanceSnapshot, SourceTransaction, TransactionSplit, Category, BudgetPeriod, BudgetAllocation, RolloverAdjustment, RecurringCommitment, ExpectedRefund, Employment, PayPeriod, Payslip, PensionSchemeVersion, MatchTier, ContributionEvidence, PensionScenario, DocumentReference and Insight/NotificationReceipt. Shared-space access policies are enforced server-side, not only by navigation visibility.

Keep imports/drafts reversible and calculation engines deterministic. Every new state accepted by editing must still validate, persist, reload and export/restore. Capture rationale and confidence alongside extracted/suggested facts; never fabricate unavailable provider data.

## Validation and delivery gates

- Financial invariants: integer-pence conservation, splits/refunds/transfers counted once, pending settlement dedupe, category scope, liability signs and stale-data gates.
- Period tests: weekly/fortnightly/four-weekly/month-end/leap-year paydays; late edits and rollover; irregular income/bills; restored historical data.
- Pension fixtures: no match/fixed/tiered/enhanced match, capped/qualifying/full earnings, salary sacrifice/relief at source/net pay, bonus and part-month changes, Scottish tax, multiple employments, YTD reconciliation, MPAA/taper/carry-forward unknowns, DB handling and future rule boundaries.
- Document tests: text and scanned PDFs, ambiguous labels, decimal/OCR errors, duplicates, missing employer figures, contradictory documents, old effective dates, encrypted exports and deletion. Use synthetic/redacted fixtures; human-confirmed values drive calculators.
- End-to-end acceptance: fresh install, migration, offline edits, interrupted import, failed save, relaunch/restore, provider consent expiry, background refresh, notification opt-out and device/accessibility/privacy checks.
- Managed/shared rollout requires cross-user authorisation, revocation and conflict tests. Partner features require sandbox plus controlled live acceptance before claiming parity.

Use these gates for delivery estimates after batch 0 and provider capability discovery. Assign effort bands and concrete estimates to individual tickets then; a reliable calendar for full ecosystem parity cannot be inferred from UI work alone.

## First executable implementation slice

1. Ledger/account schema and backward-compatible migration with balance snapshots.
2. CSV preview/import/export and transaction-split conservation.
3. Custom categories mapped to the existing plan plus category/payday budgets.
4. Manual employer scheme/matching form and a tested pension matching calculator.
5. Pension scenario preview showing gross contribution, genuine employer uplift and household headroom effect, with unknown tax/net-pay results withheld.
6. Follow with bills/forecasting and reviewed payslip/scheme ingestion; these unlock the strongest daily-use and pension opportunities without waiting for commercial integrations.
