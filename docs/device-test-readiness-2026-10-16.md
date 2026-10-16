# Release-readiness follow-up: 16 October 2026

Code revision: `4004ec1`. Pixel 11 Pro, Android 17. Local release APK SHA-256: `11C7E8624CD4AC7906D1FE160509A0ACEDFE9DD12C264677BC98B6F4ABD35B59`. Installed successfully over the existing app. This supplements the [ledger phone pass](device-test-ledger-2026-10-16.md); it does not replace that evidence.

## Observed results

- In the fictional workspace, Accounts exposes Set up Enable Banking before the account ledger when unpaired. The five-step guide labels the fictional workspace and disables real pairing, discovery and import actions there.
- At 200% system font size, navigation changes to a reachable menu. The guide wraps and scrolls; Next setup step can be reached. Moving from step 1 to step 2 resets the scroll position and exposes the new heading. This fixes the retained-scroll issue found in the first pass.
- HTTP callback origins are rejected inline. A fictional HTTPS origin previews its exact `/api/banking/callback` URL without contacting that host.
- Landscape: guide header/close controls remain visible; scrolling reaches Next setup step, and step 2 opens at its heading.
- Width overrides of 800dp and 1024dp exercise wider rendering. At 1024dp the app uses a navigation rail and the guide uses a centred dialog; its content and navigation fit. This is width emulation on a phone, not a physical tablet or foldable test.
- Physical size/density, font scale and portrait rotation were restored before TalkBack activation.

Local screenshots/UI trees are in the ignored `.qa/readiness-phone-2026-10-16` directory, including `15-guide-large`, `16-next-step-large`, `18-guide-landscape`, `19-landscape-next`, `21-tablet-width` and `22-wide-guide`.

## TalkBack follow-up after reconnection

TalkBack was bound with spoken/haptic/audible feedback and touch exploration active. Android reported no crashed accessibility services. The user confirmed that focused headings and buttons were spoken clearly; audio was confirmed by the user rather than captured by ADB.

With TalkBack enabled, keyboard Tab traversal reached the guide header, privacy/close controls, links and setup navigation. Disabled real pairing controls were skipped. Off-screen controls scrolled into view. Enter on Next setup step advanced from step 1 to step 2 and from step 2 to step 3; each new heading was visible at the top. Native Back dismissed the sheet and returned to Accounts. These were injected keyboard inputs, not a physical keyboard or a complete gesture matrix.

The amount visibility toggle changed its label to Show amounts. On fictional Today, the captured accessibility tree exposed Amount hidden for headroom, income and spending, with no pound figures in text/content descriptions. Evidence: `33-keyboard-tab`, `34-keyboard-next-focus`, `35-keyboard-step-two`, `37-step-three`, `38-back-dismissed` and `40-talkback-hidden-values` in the local evidence directory. No crash-buffer entry was observed during this pass.

All temporary settings were restored and read back: original Material Capsule accessibility service only, accessibility enabled=1, USB stay-awake=0, font scale=1.0, auto-rotation=0, user rotation=0, physical 1080x2410 and density 420 without overrides. Headroom was returned to personal Today with amounts shown, matching its original visibility setting. This is a scoped physical-device acceptance pass, not certification of every app screen, switch-control path or TalkBack gesture.

## Remaining live-provider check

No real server/application credentials or bank consent were available. Live bank discovery, authorisation, callback return and retrieval remain unverified. Follow [Enable Banking setup](enable-banking-onboarding.md) before that acceptance pass.
