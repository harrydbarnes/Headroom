# Coordinated amount privacy transition

Implemented the agreed transition in the shared Money component.

| Action | Previous behaviour | New behaviour |
|---|---|---|
| Hide | Swap digits for a mask immediately, then brighten it from 35% opacity over 180 ms. | Remove real text immediately, then fade the harmless frosted mask into place over 200 ms. |
| Reveal | Swap the mask for numbers immediately, then brighten them from 35% opacity. | Fade the mask out while numbers fade in over the same 200 ms. |
| Reduced Motion | No fade. | Both layers settle instantly. |

The mask and numbers now have separate native opacity layers. Interruptions cancel the previous animation. Initial renders and covered/background screens settle directly into the correct state. Hidden real text is absent from the number layer, invisible layout text and accessibility label; only the placeholder remains.

Inline amounts use explicitly sized text attachments to support the same layered transition within explanatory text. This makes native verification of both summary figures and inline amounts important.

TypeScript and 147 tests pass, including hidden-layer content during repeated visibility reversals. The standalone Android APK builds successfully at `android/app/build/outputs/apk/release/app-release.apk`. No phone was connected during implementation, so the new transition has not yet been installed or visually verified on-device. The earlier native frosted-mask checks cover the previous single-layer implementation.

The APK also includes the pending removal of the workspace subtitle from all tabs.
