# UI hierarchy, 20 October 2026

## Direction

Taste skill direction: Achromatic ledger, seed 55188571. Headroom uses its existing palette and type. The brief takes precedence over the direction sheet where it requires a tinted action card, rounded bars, 48px targets and segment entrance animations.

The signature element is the income bar: planned spending takes its share and leaves headroom. Colour belongs to that data and the next action. Cards remain flat.

The questions that lead each screen are:

- Today: what is left each month, and what needs doing next?
- Plan: which saved assumptions am I editing, and are those edits saved?
- Move: what is the main constraint, and which amounts explain it?

## Task 1: Headroom bar

- Added a pure presentation helper and a labelled, 32px stacked bar under the Today headline amount.
- Segments show essentials, flexible spending, annual reserves, recorded debt minimums when present, and headroom.
- `assess` already includes debt minimums inside essentials. The presentation separates those minimums from essentials without adding them again. Headroom and total spending remain unchanged.
- If recorded minimums exceed essentials, the bar keeps essentials unchanged and explains that the baseline needs review. It does not invent an additional cost or silently cap a displayed minimum.
- Overspending uses a full error bar and an explicit text label. Zero income uses a ghost bar and an income prompt.
- Hidden amounts use five equal neutral segments, independent of amounts, debt presence or overspending. Legend values use Money. The bar is excluded from accessibility; legend rows have spoken labels and values.
- Native scale animations use useMotionValue and stop for reduced motion, a covered interface or hidden amounts. Amount and share changes replay the affected segment.
- Tests cover reconciliation, shares, overspending, zero income, zero minimums and inconsistent minimums.

## Task 2: Today

- Extracted the hero, next action, attention section and detail content into named components.
- The hero is neutral. The next action is the single tinted card with a filled primary action.
- Needs attention appears only for review backlog, expired permission or skipped setup. It opens on demand, leaving the next action near the top even when several checks are outstanding.
- More detail starts collapsed. It retains the example guide, baseline and cash-balance caveats, setup checks, budgets, pension prompt, cash and goal gaps, bank completeness, score evidence and monthly comparison.
- The hero retains the provisional or confirmed status and the limit that it is not a live account balance.
- The layout targets a 360 by 800 screen with the hero and next action visible. This remains a device acceptance check, rather than a verified pixel measurement.

## Task 3: Button hierarchy

- Added an explicit text appearance and a named TextButton wrapper. The existing secondary boolean still works.
- Text actions retain a 48px minimum target and the existing keyboard dismissal and disabled behaviour. Primary saves still respect invalid fields.
- Converted selection clearing, summary, filters, previous steps, checking connection status, guide replay and other utility actions without changing their copy or handlers.
- Quietened the competing setup review action, transaction deletion, balance recording and manual device entry actions where a primary action already exists in the same area.
- Copy lint now checks TextButton titles as well as Button titles.

## Task 4: Plan save model

Took the permitted per-section route. Plan holds one draft for the currently open sheet. Budgets, pensions and bills have separate editors and save flows. Combining these into a shared sticky save bar would require a broader change to ownership, validation, commits and tab navigation.

- Added Save baseline, Save cash, Save debts, Save goals and Save evidence.
- Added a visible unsaved indicator and a text Discard action.
- Untouched drafts do not show as dirty merely because opening a section normalises existing goal dates.
- Closing an edited section asks before discarding it. Successful saving closes directly. Failed saving leaves the draft open.
- Sheets cover the tab controls, so there is no new global tab interception. Other planning editors retain their existing saving behaviour.

## Task 5: Move

- Opens with the verdict. Unconfirmed move assumptions show a prompt without result amounts.
- Retains the calculator warning order and existing messages. The verdict shows the two or three relevant amounts, such as loan and limit, LTV and ceiling, completion cash and retained cash, exchange cash, or monthly headroom.
- The existing baseline and housing confirmation gates still control post-move headroom. No tax, lender or affordability rules changed.
- Property inputs, buyer and tax, sale costs, purchase fees, borrowing, exchange timing and housing now use collapsed disclosures with current-value summaries. Financial summaries use Money.
- Extracted the assumptions and housing components with readable formatting. Kept the cost breakdown and scenario behaviour.

## Task 6: Zero-value fields

- Resting zero values show as empty fields with a numeric 0 placeholder. Labels remain visible.
- An empty draft commits zero only where the minimum is zero. Positive minimums, decimal precision, range and integer checks remain enforced.
- Invalid drafts retain their text and error. Valid non-zero money still converts from pounds to pence through the same rounding operation.
- Added pure helper tests for display, clearing, money conversion and validation boundaries.
- Final audit also checked accessible legend labels, concealment of an empty income state, and replay when values change without changing proportions.

## Verification

- TypeScript and the full Vitest suite passed after each task. The final suite includes 273 tests.
- Existing light and dark palette contrast tests now include text and text-action pairs used on the new surfaces. These are static palette checks, not rendered theme checks or dynamic Android colour checks.
- Taste source lint for HeadroomBar, MoveVerdict and Disclosure reported zero failures and zero warnings.
- No dependencies, stored data shapes, calculator functions, thresholds or finance rules were changed.
- Android export passed. This is separate from APK installation and device testing.

## Not run

ADB reported no connected device. No Android emulator was available in the inspected local SDK. No APK installation, rendered screenshots, TalkBack, font scale, animation timing, keyboard or physical device checks were run. The browser inspector was not used because these are native React Native screens, with no existing browser build configured for this check.

Human verification is still needed for light and dark appearance, 360 by 800 framing, 1.3 font scale, disclosure focus order, reduced motion, hide amounts and interrupted transitions. Source and static contrast checks do not establish those results.

## Decisions and recommendations

- Confirm that collapsed Needs attention is the preferred tradeoff for keeping the next action visible when multiple checks are outstanding. The checks and their actions remain available in one tap.
- Consider a separate coordinated draft model if one save action across baseline, budgets, pensions and bills becomes a product requirement.
- Consider explaining the relationship between setup checks, baseline confirmation and move confirmation in one place. They remain distinct in this change.
- Accounts remains in the tab bar. Any navigation change needs a separate product decision.
- The server pairing flow retains its structure. Only the competing manual-entry action uses the quieter button appearance.
- No visual review score or screenshot-based approval is claimed without running the native screens.
