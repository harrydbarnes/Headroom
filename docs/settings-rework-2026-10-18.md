# Settings rework, 18 October 2026

## Changes

Replaces the seven Settings section sheets with grouped inline preferences and local full-screen routes: home, backup, rules, examples, link and about. Adds Settings-only group, navigation, toggle, segmented, action, detail and expandable help components. Home and detail content use a centred column of at most 640 dp. Rows have minimum 56 dp targets; controls have minimum 48 dp targets. Colours come from theme tokens. Long text wraps rather than clipping; theme segments stack above font scale 1.3. No route animation is used.

The home scroll view remains mounted at its full layout size while details cover it. Its offset is recorded and restored when returning from a detail, and accessibility focus returns to the originating row. Detail headings receive accessibility focus. Android back first returns home, then uses the existing last-tab close behaviour. Settings resets home when reopened, except for a new deep-link request. All seven old deep-link names are supported, including Appearance and Privacy scroll anchors. Stale asynchronous results are prevented from appearing on a different route or a later visit.

App lock preserves the existing hardware and enrolment checks and authenticates before saving the preference. Cancellation or failure leaves the preference unchanged and reports an error in the Privacy group. Screen protection retains the existing controller, confirmed applied state and retry action. The existing privacy gate continues covering financial screens while protection is pending or has failed; its retry controls remain available there.

Notices are scoped to the producing route or Privacy group. Manual bank details results are shown in Link this phone rather than duplicated in the app shell. Existing store, service, backup, calculation and API code is unchanged. All original disabled guards are retained, including the distinct export and restore guards. Disabled bank actions explain example mode, and reset/delete explain blocked storage.

## Decisions S1 to S6

- S1: Compact bottom navigation is hidden in Settings. Wide rail remains. The header X keeps its existing close behaviour, including on details. Detail back returns home; Android back returns home before closing Settings. This preserves the explicit requirement not to alter other header behaviour.
- S2: Delete is in the separate final Remove data group. Unlink is a destructive action within Link this phone.
- S3: Home labels use Link this phone and Example data and guide. Internal legacy section names remain only for compatibility. User-facing text uses data and permission.
- S4: No dependencies added. Route mapping and summaries are pure TypeScript; navigation state stays in Settings.
- S5: The header amount toggle now has a filled primary container and primary icon tint while selected. Its icons, action and selected accessibility state are retained. Shared Sheet is unchanged.
- S6: Hide screen now uses the existing CoverWorkspace context, with a shield-lock icon distinct from the header amount eye.

## Brief conflicts and deviations

- RuleManager is reused unchanged as explicitly required. Settings section navigation no longer uses sheets, but RuleManager still opens its existing shared sheet to edit an individual rule. Removing that remaining modal would require changing a component the brief requires us to leave unchanged.
- The brief supplies “figures” in the About paragraph while explicitly prohibiting that word in S3 and requiring the copy glossary. The paragraph uses “data you’ve confirmed” instead. This is the only wording deviation from the supplied final copy.
- Exact supplied long titles and subtitles take precedence over the approximate four-word and one-line limits. They wrap to preserve readable content, including at large font sizes. Values move below titles above font scale 1.3.
- Backup help keeps the supplied intro visible and reveals the supplied token/credential explanation through More detail. No extra copy was invented for the expander.
- The checklist mentions disabling delete in example mode, but the structure, exact copy and requirement to preserve guards explicitly support Delete example data. Deleting examples remains available with the original busy, banking-busy and storage-blocked guards; bank linking remains disabled in example mode.
- No device or emulator is available here. Before/after screenshots are unavailable, and visual or native interaction checks have not been represented as passes.

## Shared-component follow-ups, not changed here

1. Shared Sheet still offers scrim, drag handle, text ×, header and bottom Close dismissal affordances. Consider one clear close control plus swipe.
2. Its cover-screen eye is still visually similar to the header hide-amounts eye. Use a distinct icon and label in a separate change.
3. Shared SectionRow still uses the text › glyph. The earlier copy work already removed the “Open section” label suffix and supplies a separate accessibility hint. New Settings navigation uses chevron-right icons.
4. Shared Sheet still uses a text × rather than an icon.

## Verification

Automated checks:

- TypeScript: passed.
- Vitest: 22 files, 245 tests passed, including 22 Settings model/count cases.
- Android export: passed.
- Whitespace check: passed.

All manual checks below are **not run: no Android device/emulator available**. Source inspection and pure tests do not substitute for these checks.

| # | Device check | Status |
|---|---|---|
| 1 | Theme persistence, wallpaper support below Android 12 | Not run |
| 2 | Settings/header amount synchronisation and visible selected state | Not run |
| 3 | App lock enable, cancellation, missing biometrics and disable | Not run |
| 4 | Screen protection pending, success, forced failure and retry | Not run |
| 5 | Hide screen now and return | Not run |
| 6 | Backup saved/cancelled/shared, restore counts/success/not saved | Not run |
| 7 | Example switch/reset/restart and original disabled guards | Not run |
| 8 | Pairing link, manual details, unlink and Accounts deep link | Not run |
| 9 | Android back from detail and home | Not run |
| 10 | Close and reopen resets home; fresh deep link wins | Not run |
| 11 | Delete confirmation, counts and example/personal wording | Not run |
| 12 | Light, dark, wallpaper, 360 dp at font scales 1.3/2.0 and wide layout | Not run |
| 13 | TalkBack headings, row labels/states, detail and return focus | Not run |
| 14 | Reduced motion and no non-essential route animation | Not run |

Screenshots at matching sizes: home before/after, detail before/after, dark before/after are all unavailable for the same reason.
