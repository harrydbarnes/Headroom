# Headroom copy style

Use British English, sentence case and typographic apostrophes. Be direct, calm and specific. Buttons start with a verb and normally contain at most three words. Section titles normally contain at most four words. Visible helper summaries contain at most 25 words; preserve full caveats in HelpNote details. Dialogs describe consequences and recovery in at most two sentences. Use Close for panels, Dismiss for messages and Cancel for dialogs.

| Concept | Preferred text |
| --- | --- |
| Personal information on the phone | your data |
| Fictional demonstration | example data |
| Incoming/outgoing money | Money in / Money out |
| Transaction classification | Type: Spending, Income, Refund, Transfer, Repayment, Needs review |
| Phone/server setup | Link this phone |
| Remove this phone's server link | Unlink this phone |
| Server-issued link that works once | pairing link |
| Credential for manual entry | device token |
| Owner's server | your Headroom server |
| Address of that server | server address |
| Bank access | Connect a bank; bank permission |
| Fetching transactions | Refresh transactions |
| Completeness | Check this month is complete |
| Unlinked accounts | Cash and other accounts |
| Monthly remainder | monthly headroom: what’s left after planned spending |
| Confirmed income/spending | monthly baseline: your confirmed monthly income and spending |

Display calendar dates as 18 Oct 2026, details as 18 October 2026, months as September 2026, tax years as 2026/27 and instants as 18 Oct 2026, 14:30. Typed dates use DD/MM/YYYY, months MM/YYYY. Keep ISO in storage, APIs, exports and filenames. Calendar dates use UTC parts; instants display in Europe/London.

Do not use long dashes, double hyphens, internal enum values or technical storage terms in ordinary UI copy. Middle dots are visual list separators only; use commas for accessibility labels. Technical terms belong in defined Advanced/owner sections. Keep financial/tax meaning, thresholds and uncertainty intact. Never promise data was unchanged when the write outcome is unknown.

Copy lint scans the migrated string modules and UI call sites. It checks jargon, UK spelling, ISO display examples, dashes, fixed button wording, helper length, alert organisation and shared date display. Internal error keys, explicit date placeholders, custom user/bank names and native status/navigation labels are documented exceptions. Transaction accessibility sentences retain the complete detail requested in the brief, even though they exceed the general eight-word label rule.

Financial stress labels use “2 percentage points” to avoid confusing an absolute rate increase with a relative 2% change. Technical pension-limit wording stays intact inside Advanced pension limits details. Unknown errors must not promise that an asynchronous write left data unchanged.

Describe Headroom's own database encryption separately from Android storage encryption and screen lock. Explain that linked bank data is also cached on the owner's server. Describe encrypted server connection credentials, not stored bank passwords. Backup exclusion describes what the application adds; free-text notes are included. See the claims audit in `copy-fixups-2026-10-18.md`.
