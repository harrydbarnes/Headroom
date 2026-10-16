# Headroom P3 implementation — 0.2.3

Implemented 15 October 2026 on the existing main working tree, preserving P1/P2 changes. This completes the scoped P3 source implementation. Native visual, accessibility, privacy and live-bank acceptance remain separate release gates.

## Before and after

| Area | Before | After |
| --- | --- | --- |
| Motion | Spring/timing values lived in individual components; active animations had no consistent cancellation path | Shared motion tokens and cancellation owner. Navigation, screen changes and sheets stop replaced animations and stop when hidden, covered, reduced-motion or unmounted. Reduced motion defaults on while the system setting is loading; a late initial result cannot override a newer setting event. |
| Typography and framing | Small body text, heavy headings and similar rounded cards dominated summaries | Shared display/headline/title/body/label/caption roles; 16/24 body text, 14/20 field labels, lighter heading weight, quieter dividers, plain/outlined card variants and less repetitive framing on Today. Screen names lead the app header. |
| Phone/tablet layout | One-column summaries, window-based scenario columns and full-width sheets | Today summaries and scenarios use their measured container width and text scale before choosing columns. Sheets become bounded 720-pixel dialogs on sufficiently wide/tall windows, remain bottom sheets on compact/short windows, account for safe areas, and keep an accessible close control beside the title. |
| Navigation and large text | Fixed minimum tab widths could overflow compact layouts; rail sizing ignored text scale | Scrollable labelled bottom navigation; a scrollable rail on wide/tall windows with bounded text-aware width. Summary rows stack on narrow/large-text windows, headers allow wrapping and amount fields keep native text scaling. |
| Example mode | A few current-month rows, no full evidence journey or original-data reset | Four-step persistent guide, three fictional complete past months, current items to review, annual-bill exclusion example, a two-sided transfer and two confirmed Move scenarios. Replay keeps edits; reset replaces only example data and clears stale example undo. |
| Existing example edits | A new richer fixture could silently replace old experiments | Earlier examples are retained. The guide explains the upgrade and asks the user to reset only the example workspace to load the complete journey. |
| Temporary privacy | Hide amounts masked summaries but left forms readable | Eye-off controls in the app header and editor headers cover the whole workspace, hide native sheets and remove financial content from accessibility traversal while preserving mounted state and drafts. Show workspace or Android Back returns to the previous task. Device authentication remains controlled by app lock. |
| Investment explanation | A zero allocation required reading the general allocation rules | The zero amount explains unmet debt, cash, goal, horizon, selected-share or remaining-surplus conditions beside the figure. The assumptions remain collapsed. |

## Scope and preservation

- No new dependency was added. The runtime remains React Native/Expo; the Compose-specific adaptive skill APIs were inapplicable and were not introduced.
- Existing personal figures, classifications, coverage, rules and scenarios are not overwritten by the example upgrade/reset. Pairing, preferences and active personal/example choice are retained. Resetting examples does not advance the personal import generation or cancel a personal refresh.
- Guide progress is validated optional workspace metadata in the existing backup/storage formats. Existing backups remain loadable. New samples are created only for new installations or explicit example reset; dates are relative to creation, with no future current-month entries even on the first day of a month.
- Example scores, attestations and scenarios are fictional and labelled as such. They are never copied into the personal workspace.
- Financial calculation order and provider consent/storage behaviour are unchanged by this batch. The zero-investment explanation describes the existing calculator result.
- The temporary cover is a UI privacy action. It does not add encryption, authentication or protection to other apps. Existing native screenshot/app-switcher protection and app-lock policies remain in force.
- Existing screen instances stay mounted during navigation, and adaptive columns keep stable child identities. Focus callbacks and modal visibility now respect both the active destination and the privacy cover. Real focus/scroll continuity is still a device acceptance check.

## Verification

- TypeScript: passed.
- Vitest: **143 tests passed across 12 files**. Added checks cover example reset isolation/undo, guide metadata, fictional evidence/annual exclusions/transfers, first-day dates, actual-width/text-scale layout policy and transition cancellation order.
- Static light/dark palette text and action pairs passed **4.5:1** contrast checks. This checks the specified colour values, not rendered text, wallpaper palettes or every native state.
- Android Hermes export: passed (738 modules, 2.3 MB bytecode and one icon font asset). An export is not an APK installation or native runtime proof.
- Git whitespace validation: passed.
- ADB inventory: no connected phone/emulator. No native screenshot comparison or screenshot baselines were generated or updated.

## Next batch: device and release acceptance

The next useful batch is verification and fixes driven by evidence, rather than a new priority tier:

1. **Compact/landscape/tablet:** run at approximately 360-pixel portrait, short landscape and wide tablet windows; test 100%, 200% and 300% system text. Verify every destination remains reachable, amounts/labels wrap, dialogs fit, keyboards do not cover actions and comparisons reflow without losing selection.
2. **Motion/focus:** rapidly switch tabs; open/close/drag sheets; toggle reduced motion; rotate; background and resume. Verify no stale animation or focus jump. Check TalkBack heading/close controls and focus restoration.
3. **Privacy:** cover from a Plan draft, then return and apply/cancel it. Verify sheets disappear with the cover, financial nodes are not spoken while covered, and native app lock/screenshot/app-switcher behaviour still passes the P1 matrix.
4. **Examples:** load/reset the full guide, classify a current item, inspect past coverage, preview annual exclusions, compare the two Move scenarios, relaunch and verify progress. Return to personal data and independently confirm it is unchanged.
5. **Live bank/release:** retain the P1/P2 real HTTPS consent, cancellation/reconnect, partial refresh and durable relaunch checks. Track the unresolved dependency advisory roots recorded in the P1 handover before distribution.

No commit, push, deployment, APK installation or real-bank operation was performed.
