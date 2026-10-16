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

## Incomplete checks

TalkBack was enabled and Android reported touch exploration active. Its first-run tutorial appeared. USB disconnected during the ensuing permission screen, before the app focus/keyboard pass. Spoken output, app focus traversal and hardware-keyboard interaction are therefore unverified. This is not full accessibility certification.

At disconnection, temporary TalkBack and USB stay-awake settings still needed restoration. The app had last been in the fictional workspace. Restore the original accessibility service (`com.pryshedko.mtisland/com.pryshedko.mtisland.service.GlobalActionBarService`), accessibility enabled=1 and stay_on_while_plugged_in=0, then leave fictional mode and return to personal Today once the phone reconnects. Display size/density and font/rotation were already restored.

No real server/application credentials or bank consent were available. Live bank discovery, authorisation, callback return and retrieval remain unverified. Follow [Enable Banking setup](enable-banking-onboarding.md) before that acceptance pass.
