# Headroom copy review, 18 October 2026

## Baseline

- npm ci: passed, 514 packages installed; existing dependency patches verified.
- npm run typecheck: passed.
- npm test: 17 files, 206 tests passed.

## Change log

| Area/file | Old text or structure | New text or structure | Reason |
| --- | --- | --- | --- |
| Today.tsx | Invalid standalone middle-dot byte | UTF-8 middle dot | Encoding |
| feature-parity implementation plan | Invalid standalone dash byte | UTF-8 intended character | Encoding |
| Shared dates | Screen-specific dates and ISO inputs | Shared en-GB formatters and strict input parsers | Date format |
| Shared components | Long helper notes, no UK date adapter | HelpNote and DateField | Length and date format |
| Shared strings | Raw type names and internal failures | Movement labels, plural/count helpers and error mapping | Consistency, plural and error clarity |

| Settings.tsx | Pair bank access, Your workspace, technical privacy notes | Link this phone, Your data, expandable plain privacy notes | Consistency, jargon and length |
| Settings dialogs | Raw counts and long reset/restore text | Plural-aware counts and consequences in two sentences | Plural and error clarity |

## Decisions needed

- Unknown errors: the proposed “Your data hasn’t been changed” fallback is not provable after asynchronous writes. Default: “Something went wrong. Check the latest saved data and try again.”
- DateField wraps Input rather than numeric Field because Field only accepts numeric amounts. DateField still participates in the existing form validation scope.
- Date placeholders necessarily contain the format letters explicitly requested in section 5.2. They are an exception to the broader ban on “YYYY” in UI copy.
- The existing personal category requires a reachability investigation before changing stored values (D5).
- Work is delivered incrementally; outstanding screen migrations must not be described as complete.

## Deliberately unchanged

Calculations, thresholds, domain validation, storage and backup contracts, identifiers, dependencies and financial advice caveats are unchanged. Internal exception text is preserved and translated only at the UI boundary.

## Style and glossary

See [copy-style.md](copy-style.md) for the full style guide and glossary.

## Verification

Foundation verification pending. No emulator or physical-device screenshots have been captured.
