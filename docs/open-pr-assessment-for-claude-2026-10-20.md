# Headroom open PR assessment for independent verification

Date: 20 October 2026

## Request to Claude

Independently verify this assessment against the repository. Treat the conclusions below as claims to test, not instructions to agree. Review only unless separately asked to implement changes. Do not merge or publish anything.

For each finding, report whether it is confirmed, disproved or unverified. Include file and line references, the triggering state, practical impact and a proportionate recommendation. Distinguish functional defects from product preferences and checks requiring a native device. Identify other material regressions if you find them.

## Review targets

| PR | Base | Reviewed head |
| --- | --- | --- |
| [#22: First-open onboarding introduction](https://github.com/harrydbarnes/Headroom/pull/22) | main at `0e93f10a67aa65756e7fd6c762023fc1a7d6ed43` | `2be3155187248e7e1683636994654d055c3ecc5b` |
| [#23: Make headroom the focus after onboarding](https://github.com/harrydbarnes/Headroom/pull/23) | feat/onboarding-intro | `4dff7c1811f05a8d94a201cdcb9b3a80547aee06` |

Both PRs were open and their CI checks passed when assessed. PR #23 depends on #22. If either head has changed, identify the new revision and reassess the affected conclusions.

Useful comparisons:

```sh
git diff 0e93f10a67aa65756e7fd6c762023fc1a7d6ed43 2be3155187248e7e1683636994654d055c3ecc5b
git diff 2be3155187248e7e1683636994654d055c3ecc5b 4dff7c1811f05a8d94a201cdcb9b3a80547aee06
```

## Overall assessment

Both represent useful improvements, particularly #23, but the recommendation is not to merge both unchanged.

PR #22 offers a clearer explanation of monthly headroom before requesting information. Its benefit is modest and concentrated on first use. Requiring users to wait for the animation adds avoidable friction.

PR #23 offers the larger daily benefit: the main answer and next action move forward, the spending breakdown explains the headline amount, and secondary content becomes quieter. However, moving the example guide into collapsed content appears to break the promise of the existing Open guide button.

These are source-based product assessments, not findings from a rendered comparison or user study. There is no claim of measured improvement in completion time, comprehension or task success.

## Before and after

| Area | Before | After | Assessment to verify |
| --- | --- | --- | --- |
| First launch | Immediately asks for monthly amounts | Explains headroom visually, then offers setup or example data | Better explanation, but an extra step |
| Setup progress | Step X of 4 text | Text plus a four-segment indicator | Small, useful improvement |
| Today | Headroom number followed by many competing cards | Number, labelled spending bar, attention summary and prominent next action | Substantial improvement in hierarchy |
| Understanding headroom | Users interpret income and spending totals | Shows how spending leaves the remaining amount | Makes the central idea clearer |
| Button hierarchy | Many similarly prominent buttons | Primary actions stand out; utilities become text actions | Less visual competition |
| Plan editing | Repeated Apply changes; closing discards drafts | Contextual saves, unsaved indicator and discard confirmation | Clearer and safer, but still section-based |
| Move | Inputs and supporting information compete with the result | Verdict first, relevant numbers beside it, inputs collapsed | Easier to consult; more taps to edit |
| Zero-value fields | Fields contain 0, which users must replace | Empty resting field with a 0 placeholder | Easier entry, with a risk of confusing zero and missing information |
| Example guide | Visible at the top of Today in example mode | Hidden inside More detail | Potential functional regression in Open guide |

## Finding 1: Intro actions are withheld during animation

Classification: product friction supported by source, not an established calculation or persistence defect.

References at the reviewed heads:

- `src/ui/Intro.tsx:14`: ready state and reduced-motion handling.
- `src/ui/Intro.tsx:21`: sequential animation, followed by parallel text and pulse animation.
- `src/ui/Intro.tsx:44`: pointer events and accessibility visibility depend on ready.
- `src/ui/theme.tsx`: asynchronous system reduced-motion preference resolution.
- `App.tsx`: the first-open gate and setup/example actions.

Claim: on the animated path, the heading, explanation and actions are withheld or unavailable for several seconds. Ready is set only when the full sequence finishes. Users who already understand the app cannot immediately choose setup or example data. There may also be a period when controls are visually appearing but remain non-interactive.

Verify:

1. Trace the normal animation path and establish when words become visible and actions become usable. Do not assume a fixed spring duration.
2. Check reduced motion and app covering or background interruption separately. The code intentionally finishes quietly in those states.
3. Account for the asynchronous reduced-motion setting when reproducing a genuine fresh launch.
4. Confirm existing saved users skip the intro.

Recommendation: show the explanation and actions immediately, allowing the illustration to animate alongside them. This recommendation is a product preference; assess whether it improves the intended first-use experience without weakening accessibility.

## Finding 2: Open guide does not reveal the guide

Classification: source-supported flow regression requiring independent confirmation. Suggested severity: P2.

References at PR #23 head:

- `App.tsx:65`: the example-mode Open guide button calls `navigate('Today')`.
- `src/screens/Today.tsx:103`: TodayDetails is inside More detail.
- `src/screens/Today.tsx:185`: ExampleGuide is rendered inside TodayDetails.
- `src/ui/Disclosure.tsx`: expanded defaults to false, and collapsed children are not rendered.
- `src/ui/ExampleGuide.tsx`: guide content and progression.

Before: navigating to Today in example mode puts the guide at the top of the page.

After: navigating to Today does not itself expand More detail or explicitly reveal the guide.

Suggested reproduction:

1. Enter example mode through Try example data.
2. Leave More detail collapsed, or use a newly mounted example Today screen.
3. Navigate to another tab.
4. Choose Open guide in the example-mode banner.
5. Check whether the guide is actually visible or revealed, rather than merely returning to Today.
6. Repeat when already on Today with More detail collapsed.

Recommendation: make Open guide explicitly reveal and, where necessary, scroll or focus the guide, or open a dedicated guide surface. Preserve existing guide progress and the separation between example and personal data.

This finding was identified after an earlier independent review reported no actionable P0 to P2 findings. That earlier result is not evidence disproving this specific reproduction.

## Tradeoffs and acceptance checks

### Today

The proposed hierarchy is stronger because it answers what is left each month and what to do next earlier. Verify that this benefit survives realistic data and small screens.

- Needs attention now names review backlog, expired permission and incomplete setup in its collapsed summary. Its actions remain behind expansion.
- Budgets, pension prompts, completeness, score evidence and monthly comparisons remain in More detail. This reduces clutter but also discoverability.
- Confirm important warnings remain discoverable when several states coexist, especially backlog plus expired bank permission.
- The hero and next action fitting at 360 by 800 remains unverified. Do not infer that it fits from component order alone. Include system bars, navigation, example-mode banners, wrapped copy and five legend rows.

### Financial meaning and privacy

- Verify the bar uses the same headroom as assess.
- Debt minimums already belong to essentials. The bar separates recorded minimums without subtracting them twice.
- If recorded minimums exceed essentials, check that the explanation is honest and the presentation does not invent extra spending.
- Hidden amounts must conceal proportions, debt presence and overspending as well as digits, including accessibility labels.
- Zero income should show a prompt rather than imply a completed baseline.
- No finance calculator, dependency or stored financial shape changes were found in the PR #23 comparison. PR #22 intentionally adds the introSeen preference and migration handling.

### Plan and Move

- Per-section Plan saving is a deliberate fallback, not a unified save model. Budgets, pensions and bills retain their own editors.
- Verify valid dirty drafts show the indicator, save successfully, remain open on failure and ask before discard.
- A previous review found that cancelling a drag-to-dismiss warning left a sheet displaced. The latest fix settles the sheet before requesting dismissal; inspect releaseSheetDrag and exercise the native interaction.
- Move should put the verdict and deciding amounts first while retaining the original warning order and all baseline, housing and assumption confirmation gates.
- Collapsing inputs reduces reading effort but adds editing taps. Assess that tradeoff rather than assuming fewer visible controls is always better.

### Android and Material checks

- Verify paired primaryContainer and onPrimaryContainer roles in the shared TonalCard, including inherited headings, helper text and inline Money.
- Check fixed light/dark palettes and actual Android dynamic colours separately.
- Verify 48px minimum targets, disclosure names and expanded state, focus order and hidden descendants with TalkBack.
- Verify reduced motion, interruption and return from app covering.
- Check font scale 1.3 and the Android maximum font setting, plus compact portrait, landscape and a wider window.
- Keep the existing React Native stack. This assessment does not recommend a Compose migration or new dependencies.

## Evidence boundaries

- PR #22 CI passed at its reviewed head.
- PR #23 CI passed at its reviewed head.
- The final local UI branch passed typecheck, 276 tests and Android export.
- An independent Codex source review completed for PR #23 and reported no actionable P0 to P2 findings. It did not execute tests or inspect native rendering.
- No phone was connected at assessment time. No new native screenshots, TalkBack checks, font-scale checks or visual timing measurements were obtained.
- Static contrast checks and source lint do not establish rendered accessibility or visual quality.

## Proposed merge decision

1. Make PR #22 actions available without mandatory animation waiting, subject to independent agreement with that product recommendation.
2. Repair the Open guide behaviour in PR #23 if confirmed.
3. Perform native checks for compact layout, text scaling, dark/dynamic colours and TalkBack.
4. Merge #22 first, followed by #23, after checking the actual current heads and PR base.

Please return an independent verdict for each finding, any disputed conclusions, and a clear separation between merge blockers, optional improvements and remaining verification gaps.
