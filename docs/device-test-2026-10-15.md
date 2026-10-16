# Pixel device test — 15 October 2026

Tested Headroom 0.2.3 on the connected Pixel 11 Pro, Android 17 / API 37, 1080 × 2410. Used fictional data only. No bank was paired or consent granted.

## Outcome

The main manual-planning workflows work on the phone. Two defects found during testing were fixed and retested. This is a functional device check, not full release certification or a performance benchmark.

Installed a standalone arm64 Android APK (`uk.co.habylab.headroom`, version 0.2.3), built locally with test signing. It runs independently of Expo Go and Metro. Earlier broader workflow checks used Expo Go 57.0.9 against the same source. Evidence is stored locally under `.qa/phone-2026-10-15/` (ignored by Git).

## Fixed during testing

| Problem before | Change and verified result |
|---|---|
| Opening the overview produced the native error “Text strings must be rendered within a Text component.” Whitespace between adaptive panels reached a native View. | AdaptiveColumns filters whitespace and wraps visible primitive content in native text. Overview renders normally; regression test added. Evidence: 14-plan-summary, 15-overview-fixed. |
| Advancing from a scrolled onboarding step retained the old scroll offset, hiding the next heading and instructions. | Remount the onboarding page when its step changes. Native APK retest starts step 3 at its heading after advancing from the scrolled spending step. Evidence: 12-cash-debt, 59-native-step-reset. |

## Checks completed

| Area | Evidence / result |
|---|---|
| Onboarding and calculation | Fictional £5,000 income, £2,500 essentials, £700 flexible and £100 annual reserve produce £1,700 headroom. Keyboard, scrolling and step navigation work. |
| Plan editor | Draft £900 survives temporary cover; invalid -1 shows an error and disables Apply. Cancel preserves £1,700. Applying £800 flexible updates saved headroom to £1,600. Captures 18–22. |
| Privacy cover | Open editor and amounts disappear from the accessibility tree while covered; returning preserves the draft. |
| Example isolation | Example transactions and scenario selections do not change the personal £1,600 plan. Capture 39-personal-isolation. |
| Transaction review | Bulk review changes 3 outstanding to 0 and reviewed spend £1,365.78 to £1,501.42. Undo restores both. Captures 25–27. |
| Manual transactions | Create £12.34 purchase, edit to £15.67, delete with native confirmation, then undo deletion. Captures 28–34. |
| Move comparison | £590k versus £550k examples render both sets of results and differences: monthly mortgage approximately -£221; exchange gap -£4,000. Captures 37–38. |
| Unpaired accounts | Clear unpaired explanation, disabled bank discovery/refresh and functioning Settings setup route. Captures 41–42. |
| Appearance | Dark theme renders; reduced-motion preference saves; disabling Move removes its tab. Captures 43–45. No frame-time measurements were taken. |
| Amount masking | Summary values become bullets and remain masked after Android activity recreation. Captures 47, 49, 51. Editable fields intentionally remain visible. |
| Text size | At 200%, tested overview and Settings wrap, and value rows stack. Navigation issue recorded below. Original system font scale 1.0 restored. |
| Backup export | Android folder picker saves real JSON to a dedicated Headroom-QA folder. Exported test file contains the expected £1,600 plan and no bank credentials. Captures 52–55. |
| Native backup restore | Exported JSON passes validation, explicit replace confirmation appears, and restore reports saved. Captures 62–63. |
| Native capture protection | Applied state confirmed; both activity and modal windows have SECURE. Captured app area is black while protection is enabled. Protection turned back off after the check. Capture 64. |
| Native app lock | User completed fingerprint authentication to enable. Background/reopen hides the workspace. Cancelling authentication keeps it locked with an error. Force-stop/cold-start also opens the lock screen. Captures 65–69. User authenticated again after cold start; overview restored £5,000 income, £3,400 spending/reserves and £1,600 headroom with Metro stopped (72-after-user-unlock). |
| Source verification | TypeScript passes; all 144 tests across 12 files pass outside sandbox. Initial sandbox run blocked local-server connections/file rename; unrestricted rerun passed. `git diff --check` passes. |

## Priority follow-ups

1. **P2 — Activity density:** at normal text size the controls occupy the first viewport before any transaction appears. Compact the summary/filter area and move secondary actions into a sheet. Capture 24-example-activity.
2. **P2 — large-text navigation discoverability:** at 200% text the bottom navigation scrolls horizontally, but Accounts is partly off-screen without an obvious cue. Make every destination discoverable and verify selection scrolls it into view. Capture 49-large-text-ready.
3. **P3 — development-runtime backup limitation:** Expo Go fails to read its picker cache with a READ-permission error. The same exported file restores successfully in standalone Headroom. Document standalone testing as the acceptance route; investigate Expo Go cache scoping separately. Captures 57 and 62–63.

## Limits and phone state

Real bank pairing, consent, refresh, expired-consent recovery and actual provider data were not tested. TalkBack navigation, tablet/foldable layouts, landscape, notification interruption and measured animation/frame performance remain unverified. The app lock checks do not establish encrypted SQLite storage.

Headroom and Expo Go remain installed. The standalone app contains only fictional QA figures; its app lock is enabled and it was left unlocked on Today after the final user-assisted check. The Headroom-QA folder contains the fictional backup. Phone font scale and rotation preferences retain their original values. The temporary Metro server and USB port forwarding were stopped after testing. The tested APK SHA-256 is 211F5E4F440426AC18872B475655B85CAD01B3DF8E6D56CCF7B340B85EBCE3C8. App-only logs for the final native process contain no fatal or React Native JavaScript errors. No commits, pushes or deployments were made.

## Follow-up implementation

The two P2 priorities above were subsequently implemented and verified on this Pixel. See [Activity and navigation update](activity-navigation-update-2026-10-15.md) for before/after evidence and validation. The original observations above describe the pre-update build.
