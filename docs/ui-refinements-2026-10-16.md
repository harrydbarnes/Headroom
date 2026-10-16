# UI refinements — 16 October 2026

## Requested changes

- Replaced the permanent storage footer with brief Saving / Saved feedback. Save errors remain persistent and actionable. Feedback overlays the interface rather than reserving an empty footer row.
- Extended the bottom navigation background through the system gesture inset, removing the separate empty-colour strip on compact layouts.
- Enlarged the bottom-sheet drag handle to a 44 dp touch region and added drag capture on the sheet header. Downward dragging follows the finger and dismisses beyond the existing threshold. The handle also exposes an accessibility dismiss action. Wide centred dialogs retain their existing close controls.
- The main eye button now toggles amount visibility in place. Hidden amounts render a constant, diffuse mask with no real digits, sign or magnitude. A short fade respects reduced motion; the underlying amount is replaced immediately rather than being blurred while readable. Transaction accessibility labels also honour the existing hidden-amount preference. Editable financial fields remain visible as described in Privacy settings; the editor's full-workspace cover remains available.
- Moved Backup and restore immediately above About Headroom.
- Removed the workspace subtitle from every tab and renamed Today’s main figure Monthly headroom.
- Accounts → Set up bank access now requests the Pair bank access section directly, including when Settings has previously been visited.
- Retry connection status is only offered when the device is paired, preventing the unpaired loading flash. While checking, its label says Checking connection. Button ripples are clipped to their rounded outline.

## Validation and limits

TypeScript and all 146 tests across 12 files pass. The new privacy check verifies that hidden display output is identical for zero, positive, negative and large amounts, regardless of precision. `git diff --check` passes.

The source checks initially ran without a device. The Pixel was then connected and the final standalone arm64 APK installed (test signing, version 0.2.3). Native verification is recorded below. No real bank pairing or consent was attempted.

## Pixel verification

The phone was subsequently connected and the update installed with its fictional QA data preserved. Evidence is under `.qa/phone-2026-10-15/` (continuing the established capture sequence):

- 89: Today subtitle removed, Monthly headroom label, no permanent saved footer.
- 90: hidden amounts contain no currency values in the UI tree. Initial text-shadow masks were too dotted/rectangular. The final implementation uses Android native blur on standalone placeholder text; real amounts are removed first.
- 91–92: a 420 px downward swipe starting at the inspected Appearance handle dismisses the sheet.
- 94–95: no unpaired Retry button, and Set up bank access opens the Pair bank access sheet directly.
- 96: Backup and restore is visibly immediately above About Headroom.
- 97: Show amounts restores £1,600 / £5,000 / £3,400 fictional figures.

- 100–102: final native blur verified in light and dark themes, with no real financial values present in the hidden UI tree. Show amounts restores the original values.
- System appearance and original amount visibility restored; app left on Today (103).
- App-only logs checked for fatal/React Native JavaScript errors after testing; none found.

Native blur applies on Android 12 and newer. Older-platform fallback remains a non-financial placeholder. Financial edit fields remain visible, as described in Privacy settings. Animation frame timing was not profiled.

## Subtitle and animation clarification

The workspace subtitle was subsequently removed from the shared app header for every destination, including Settings. TypeScript passes. At that point amount visibility used a 180 ms opacity fade in each direction, with the blur switching immediately. This was subsequently replaced by the coordinated 200 ms transition described in [Privacy transition](privacy-transition-2026-10-16.md); that newer transition awaits phone verification.
