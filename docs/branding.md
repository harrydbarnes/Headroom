# Headroom identity

App name: Headroom. Android package: `uk.co.habylab.headroom`.

Original artwork: `assets/headroom-icon.png`.
Launcher: `assets/headroom-launcher.png`, with a smaller central mark and more space around the h and ceiling line for Android adaptive masks.
Splash: `assets/headroom-splash.png`, a separate rounded-square tile displayed at 128 dp on a warm off-white background. The smaller size keeps its corners inside Android's splash mask. Configured with `expo-splash-screen`; native builds must regenerate resources with Expo prebuild to apply these changes.

Verified on a physical Pixel 11 Pro on 16 October 2026: release APK installed as an update, launcher comparison confirmed increased padding, and cold-start captures confirmed the rounded-square splash without clipped corners. The captured crash buffer was empty. Local evidence: `.qa/phone-2026-10-16/launcher-comparison.png` and `icon-launch-contact.png` (ignored by Git).
Generated using the built-in OpenAI image generation tool on 15 October 2026.

Prompt: Minimalist flat geometric Android icon for Headroom, a personal finance app about financial breathing space. A warm ivory lowercase h-shaped symbol with a detached horizontal ceiling line above it, leaving generous headroom, on a deep forest green full-bleed square background (#174E3B). Bold silhouette, central safe area, generous padding for Android masks, no words, currency symbols, graphs, arrows, shadows or mockups.
