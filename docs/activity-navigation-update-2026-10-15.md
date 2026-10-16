# Activity and large-text navigation update

## Changes

Activity previously placed the spending/income summary, refresh, manual entry, filters, coverage, selection controls and instructions before its first transaction. It now starts with a compact month selector, review/matching counts and two actions: Filters and Summary & actions. Transaction rows follow immediately. Previous/next month controls have explicit accessibility labels and 48 dp touch targets.

Summary & actions retains reviewed spending/income, refresh, manual entry, coverage and select-all. Selecting a transaction reveals Review selected and Clear selection above the list. Existing review, filter and undo behaviour remains in place.

The compact navigation bar previously overflowed horizontally at large font sizes, partly hiding Accounts. When the scaled destinations cannot fit, it now becomes a labelled Navigate button showing the current destination. It opens a vertical list containing every enabled destination with the current one selected. Regular-size tabs and wide-screen navigation remain available when they fit.

## Validation

- TypeScript passes.
- 145 tests across 12 files pass, including navigation fit boundaries with four/five destinations, narrow screens and 200% text.
- Updated standalone APK built and installed on the Pixel, preserving the QA workspace.
- Native Activity before/after: no rows visible before; two full rows and part of a third visible after at normal text size. Captures 74 and 76 under `.qa/phone-2026-10-15/`.
- Summary totals match the same examples (£1,365.78 reviewed spending / £5,900 income). Select-all opens Review 3 selected; clearing selection works. Filters, coverage and manual-entry routes all open correctly. Captures 77–81.
- At 200% text, all five destinations are fully visible in the navigation sheet. Accounts opens, the bottom button updates to Navigate · Accounts, and reopening the menu marks Accounts selected. Captures 84–87.
- Changing font size correctly invokes the existing app lock; the user authenticated for testing. Original font scale 1.0 restored and examples exited after verification.
- No fatal or React Native JavaScript errors found in the current native process log. `git diff --check` passes.

The changes build on the existing uncommitted workspace. No bank pairing, production release, commit or deployment is included.
