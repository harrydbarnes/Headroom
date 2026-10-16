# Headroom app assessment — 15 October 2026

## Scope and evidence

Source-based product assessment of all five exposed screens, shared controls, persistence, bank connection service, backend consent/import flow, finance rules, house calculator and existing test coverage. This is not a completed visual or device audit. No phone or emulator is connected (`adb devices -l` returned an empty list); this checkout has neither installed dependencies nor a generated Android project. No screenshots, TalkBack results, motion performance or live-bank verification were available. No tests were executed for this review. The README's previous test results are historical, not new verification.

Evidence: `App.tsx`, `src/state/store.ts`, `src/services/api.ts`, `src/lib/finance.ts`, `src/lib/calculators/houseMove.ts`, `server/index.ts`, `server/banking.ts`, `app.json`, `package.json`, existing tests and README. Recommendations below are proposals, not implemented changes.

## Verdict

Headroom has a coherent purpose: understand monthly breathing room, review spending, allocate surplus and test a house move. Its calculation and data-handling foundation is more developed than its user journey. The current interface exposes a collection of long forms and technical connection controls without guiding users to a first useful result. Prioritise trustworthy setup and a manageable weekly review before adding visual complexity.

Preserve the explicit separation between a future budget and imported actuals; preserved classifications on reimport; transfer/repayment exclusion; disclosed allocation rules; example labels; local persistence; and server-side banking credentials. The forest-green/ivory palette defined in source is a useful brand starting point. Its rendered execution remains unverified.

## Screen-by-screen assessment

| Step | Surface and task | Assessment from source | Main change |
| --- | --- | --- | --- |
| 1 | First launch / Today | Incomplete journey: starts with zero amounts and an unavailable score | Guided setup with a useful result before connecting banks |
| 2 | Accounts / connect and import | Technically capable; high setup effort and weak status visibility | Guided pairing, bank search, persistent connection status and explicit return outcome |
| 3 | Activity / review transactions | Accounting treatments exist; repeated review effort is high | Review queue, compact rows, search, filters, batch actions and undo |
| 4 | Plan / set budget and goals | Useful calculations buried below many inputs | Short grouped editing flows with a visible summary and saved state |
| 5 | Home / test a move | Useful engine; assumptions partly fixed and results can precede setup | Rename Move, gate incomplete results, expose assumptions and compare scenarios |
| 6 | Settings / manage app | No dedicated screen; data controls are embedded in Accounts | Separate appearance, privacy, backup, connections and advanced setup |

## Highest-priority changes

### 1. Create a guided first run

Today currently offers a zero-based summary, score requirements and a link to Plan. There is no onboarding state or checklist. A user must discover the intended order themselves.

Suggested flow:

1. Explain the outcome: see what remains after regular spending and future costs.
2. Choose manual setup, connect accounts, or try a separate example workspace.
3. Enter income, essentials and flexible spending; make annual reserves understandable with a yearly-to-monthly helper.
4. Add emergency cash and debt, with an explicit unknown/skip state.
5. Show provisional monthly headroom with a short list of remaining assumptions.
6. Offer bank connection and a named savings goal as subsequent steps.

Save progress and allow resuming. Do not require bank access for the first useful result. Keep setup completeness distinct from evidence completeness.

### 2. Protect real work from example mode and data loss

`setDemo` resets the plan and transactions. The confirmation makes replacement explicit, but trying the product should not require discarding a working budget. Demo mode populates a plan but supplies no example transactions, leaving the Activity workflow unexplained.

Use isolated example storage with realistic fictional transactions, review states, goals and a move scenario. Exiting should restore the user's untouched personal workspace. Add export/restore before expanding destructive controls: Android backup is disabled and there is no export UI. Keep delete, disconnect and unpair distinct, showing their exact consequences and a confirmation for each consequential operation.

### 3. Make evidence and freshness visible

The score checks `coverageConfirmed` and a user-entered `monthsReviewed`; it does not derive those months from reviewed transactions. Present this as user-attested evidence until the app can build a coverage ledger. Do not imply automatic verification.

Add per-account covered date ranges, missing periods, unreviewed counts and manual/cash coverage. Derive complete months where possible, allowing explained manual attestations for unsupported accounts. Today should show plan confirmation date, import freshness and review completeness. Never label planned monthly surplus as a current balance or safe-to-spend cash.

### 4. Finish connection and sync states

Accounts initially sets `connections` to an empty list and does not hydrate saved configuration or fetch status on entry. A saved connection may therefore be invisible until another action requests status. The status API already supplies account names, expiry and last sync; the UI shows only provider and consent end date.

Show loading, unpaired, paired, connected, expired, refreshing, partial and failed states. Refresh status on entry and app resume. Display masked account identity, supported currency, last successful sync and a reconnect action. Add searchable bank discovery instead of rendering the entire list as buttons.

For personal deployment, replace repeated server/token entry with secure one-time pairing or a QR flow, retaining manual entry under Advanced. Public distribution would need a separate identity and provisioning design; a single owner token is not a consumer onboarding system.

The browser completion page uses the same generic message after both success and cancellation redirects. Return an explicit outcome and provide an app return action with a fallback. Verify it on a real device.

Sync can return warnings after failed account imports, while the app reports a transaction count as received. Show per-account outcomes and distinguish imported, updated and unchanged items. The stored device `lastSync` should not imply every bank refreshed successfully. Disable duplicate requests while busy and keep errors beside the action that caused them; the shared message at the top of a long scroll view can be missed.

### 5. Make review manageable

Activity renders a card and six treatment buttons for each transaction. There is no merchant search, account filter, category editor, batch review, undo or pending-review-only view. The data type has a category, but the UI cannot change it. Treatment answers an accounting question; category answers where the money went. Both are needed.

Use compact date-grouped rows and a transaction detail sheet. Default to Needs review after import, with All as a secondary view. Add account/category filters, merchant search, bulk actions, remembered merchant rules and undo. Suggest transfer/card repayment pairs for confirmation rather than silently excluding ambiguous items.

Replace free-text YYYY-MM entry with a month picker. Show a selected-month empty state even when other months contain transactions; the present empty message only checks whether the entire dataset is empty. Use a virtualised list as history grows. Show pence in transaction rows; the shared formatter currently rounds all amounts to whole pounds.

## Planning and move improvements

Plan mixes baseline, debt, emergency cash, goals, investment preferences and evidence inputs in one scroll. Split these into clear sections, showing a monthly summary above the editor. Put investment settings behind an optional expansion. Support multiple debts with individual balances/APRs/minimums and multiple named goals; the current single debt and APR cannot represent a mixed debt portfolio well.

Make edits deliberate and recoverable. `Field` writes every valid keystroke into persisted state; its effect also replaces the text with the normalised numeric value. Partial decimal edits and clamping deserve device tests. Prefer draft editing with explicit validation and a clear save/apply action, or robust autosave with a saved indicator and undo. Do not silently restore invalid input on blur without explaining it.

Add reviewed actuals versus plan, followed by an explicit user-approved update to the baseline. Show category contributions to an overspend and upcoming recurring commitments once those data exist. Avoid implying the current monthly surplus calculation forecasts daily cash flow.

Rename Home to Move: Home is ambiguous alongside Today. Ask whether moving is relevant during setup and make this destination optional. The screen has detailed preset amounts, including a current mortgage, while the baseline can still be empty. With an empty plan, the current formula can display `currentMortgage - proposedPayment` as the budget left after moving. Gate the comparison until income, essentials and current mortgage inclusion are confirmed.

The calculator supports more assumptions than the UI exposes. Make fees, exchange deposit, borrowing guide, LTV ceiling, sale status and applicable buyer assumptions editable. Confirm geography and household circumstances before using a particular calculation. Show deposit timing separately from completion affordability. Add saved scenarios and a comparison of monthly headroom, retained cash, borrowing and stress outcomes. Do not claim wider geographic support until appropriate calculators exist.

## Settings proposal

Keep Accounts for everyday bank management. Open Settings from an app-bar control.

| Group | Controls |
| --- | --- |
| Appearance | System/light/dark theme, optional device colours, motion preferences |
| Privacy | Optional biometric/app lock, hide amounts, documented screenshot/app-switcher policy |
| Data | Export, restore, storage explanation, delete local data with scope confirmation |
| Connections | Consent management, pairing status, reconnect and unpair |
| Planning defaults | Emergency target, allocation preferences and optional Move destination |
| Help and advanced | Score explanation, bank coverage limitations, diagnostics without secrets, version and API pairing |

Do not add inactive notification or background-refresh switches. Add those preferences only when the corresponding features work. An app lock also requires separate decisions about database protection; a lock screen alone does not encrypt stored data.

## Material 3 Expressive direction

The current source uses custom React Native primitives, fixed light colours, one large StyleSheet and no deliberate navigation/interaction animations. Rounded corners alone do not constitute Material 3. Keep the brand and establish semantic colour, typography, shape, spacing and motion tokens.

Material 3 Expressive is the current Google direction, including stronger hierarchy and physics-based motion. Headroom is React Native: MUI is a web React library, while Compose Material3 targets native Android/Compose. React Native Paper is a plausible MD3 foundation to evaluate against the installed Expo/React Native versions; do not assume full Expressive parity or add it without compatibility checks.

Proposed application:

- Use a compact app bar, retaining brand expression primarily on Today. Make screen headings describe the task rather than repeating slogans everywhere.
- Give the primary headroom amount display typography; use clear title/body/label roles elsewhere and tabular numerals for comparisons.
- Use tonal surfaces and spacing to establish hierarchy. Reserve prominent filled containers for the primary result or action, rather than giving every block identical card treatment.
- Add icon-and-label bottom navigation with a visible selected container and adequate touch targets. Preserve per-tab scroll position and verify Android back behaviour. Use a rail/two-pane layout for larger windows if that scope is supported.
- Offer system/light/dark appearance. Generate paired foreground/background roles from the green brand seed; test actual contrast in all states. Optional device-derived colour should preserve identifiable warning and success semantics.
- Use proper selected semantics for classification choices, which currently expose a button role without a selected state. Add clear pressed, disabled, focus and loading states.
- Verify TalkBack order, large text, keyboard visibility, landscape/large-screen behaviour where supported, and 48dp touch targets. Current fixed sizes and small supporting text merit testing; they are not proof of an accessibility failure by themselves.

### Motion specification to prototype

| Interaction | Proposed behaviour | Constraint |
| --- | --- | --- |
| Tab selection | Short selected-indicator transition and restrained content fade | Preserve scroll and focus; avoid exaggerated lateral movement |
| Transaction details | Bottom sheet with responsive drag and spring settling | Reliable back dismissal and focus restoration |
| Classification | Immediate state change, subtle selection motion, undo snackbar | No delayed persistence or ambiguous completion |
| Plan edits | Stable result placement; subtle transition after committed edits | No animated number changes on every keystroke |
| Setup progression | Brief continuity between steps and a saved-progress state | Skip/resume must remain obvious |
| Sync | Progress while in flight; explicit completed/partial/error result | Never use animation as evidence of success |

Centralise motion settings and respect reduced-motion preferences. Avoid looping decorative motion, large financial-number count-ups, celebratory effects for debt, and bouncy critical warnings. Test perceived responsiveness and frame performance on a modest Android device before choosing final springs or timing.

Primary references checked for this assessment:

- [Material 3 overview](https://m3.material.io/)
- [Material motion physics](https://m3.material.io/styles/motion/overview/how-it-works)
- [Material colour roles](https://m3.material.io/styles/color/the-color-system)
- [React Native Paper theming and accessibility animation settings](https://oss.callstack.com/react-native-paper/docs/guides/theming)

## Delivery order and acceptance gates

1. **Trust and first value:** isolated examples, resumable manual onboarding, incomplete-data gates, accurate connection/sync states, export/restore. A new user can reach a clearly provisional headroom result without server setup; existing figures survive entering and leaving examples.
2. **Weekly use:** review queue, categories, filters, rules, batch actions, undo and actual-versus-plan. A representative month can be reviewed without classifying every row from scratch, and reimport preserves decisions.
3. **App structure:** dedicated settings, optional Move, explicit plan editing and scenario comparison. Back navigation, process relaunch, offline use and failed saves have recoverable states.
4. **Material foundation and motion:** theme tokens, accessible controls, system appearance, adaptive layout and restrained transitions. Validate on actual devices with large text, TalkBack, reduced motion and light/dark themes.

Restructure the single-screen implementation into screen components, shared controls, typed banking state, theme tokens and navigation before substantial interaction work. Expand tests around coverage status, failed/partial imports, demo isolation, persistence recovery and incomplete move inputs as those behaviours change. Calculation tests cannot replace full device, consent-return and accessibility checks.

Measure onboarding completion/time to first useful result, review effort, failed-sync recovery and repeat weekly use. Establish baselines first; do not invent performance targets or add sensitive financial analytics by default.
