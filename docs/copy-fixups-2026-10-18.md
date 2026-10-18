# Headroom copy fix-ups, 18 October 2026

Base: `8ae0253`, merged PR 14 on `main`. Six ordered pull requests.

## Change log

1. Privacy: distinguish Headroom's own encryption from phone protection. Explain the server cache. Describe server connection credentials rather than bank login details. Qualify backup exclusion as application behaviour, since user notes can contain arbitrary text.
2. Error layer: one exact-entry catalogue and ordered patterns in errors.ts. Compatibility exports in messages.ts contain no tables. The one-off AST extraction captured 172 old keys and both old entry-point outputs before replacing the tables. The fixture regression preserves the old precedence, including warning passthrough. All eight calculator guards now have specific input messages: projection, debt projection, buyer type, tax period, non-negative money, percentage, rate and mortgage term. These validate data reaching calculators from forms or imports, so none was dismissed as internal-only. The reported empty-message throw is now a store-message-or-fallback expression in useBanking; both branches are covered without changing behaviour. The AST coverage additionally found and mapped dynamic CSV row messages, missing record references and reconciliation reasons. Reviewed dynamic exceptions carry written reasons in the coverage test. No thrown literal changed, and no error constants were introduced.
3. Terminology: presentation values use pairing link, device token, your Headroom server and server address. Updated the server helper's console instruction, README setup path and Settings address placeholder. Exact internal thrown keys, routes and environment variables remain unchanged. The regression fixture's presentation outputs were updated for these intentional wording changes; its raw inputs remain fixed. Copy lint rejects the six banned setup phrases in presentation values. Internal exception keys are exempt because they are exact-match contracts, not presentation text.

## Claims audit

Code references establish implementation, not a deployed host's security configuration or a physical phone's behaviour. Historical delivery and device reports describe their dated evidence, not current certification.

| Claim | Code evidence | Verdict |
| --- | --- | --- |
| Own data is stored on this phone | `src/state/persistence.ts:8`, `src/state/persistence.ts:17` | Supported: app-private SQLite records |
| Headroom does not add database encryption | `src/state/persistence.ts:8`, `src/state/persistence.ts:33` | Supported: plain serialised records passed to SQLite; this says nothing about Android storage encryption |
| Phone storage encryption and screen lock apply if configured | `App.tsx:40`, `src/state/persistence.ts:8` | Platform protection, conditional wording retained; phone configuration was not inspected |
| App lock gates opening and returning to Headroom | `App.tsx:36`, `App.tsx:38`, `App.tsx:40`, `App.tsx:42` | Supported: authentication gates visible content, background relocks; no encryption claim |
| Amounts remain visible in editable fields | `src/ui/components.tsx:21`, `src/ui/components.tsx:22`, `src/ui/components.tsx:31` | Supported: amount hiding is a presentation control, not a change to form drafts |
| Linked bank data is also cached on the server | `server/banking.ts:31`, `server/banking.ts:45` | Supported |
| Server connection credentials, sessions and cached transactions are encrypted | `server/banking.ts:6`, `server/banking.ts:7`, `server/banking.ts:9`, `server/banking.ts:17`, `server/banking.ts:22`, `server/banking.ts:45` | Supported: AES-GCM with record-specific authenticated data |
| Bank login details are encrypted on the server | `server/banking.ts:20`, `server/banking.ts:21` | Removed: the app selects bank authentication without required credential inputs and redirects through the bank flow; it does not store a bank password |
| Headroom does not add bank tokens or server credentials to backups | `src/services/backup.ts:9`, `src/lib/workspace.ts:105`, `src/lib/workspace.ts:57`, `src/services/api.ts:7` | Supported: validated financial records only; connection credentials live separately. Arbitrary notes are included, so an absolute promise about all file contents was softened |
| Backups are readable files; restore replaces financial data | `src/lib/workspace.ts:105`, `src/lib/workspace.ts:106`, `src/services/backup.ts:15`, `src/state/store.ts:43` | Supported: JSON export and validated restore; phone link remains separate |
| Android backup is switched off | `app.json:12` | Supported: `allowBackup: false`; an installed build was not checked |
| Deleting financial data does not remove bank permission or the phone link | `src/state/store.ts:42`, `src/lib/workspace.ts:24`, `src/services/api.ts:10`, `server/banking.ts:23` | Supported: local clear never calls server disconnect or forgetConnection |
| Unlinking only removes this phone's saved connection | `src/services/api.ts:10` | Supported; no server revocation request |
| Disconnecting removes provider permission and server cache; local transactions remain | `server/banking.ts:23`, `src/services/useBanking.ts` (`disconnect`) | Supported: provider DELETE precedes session/cache deletion; local ledger not cleared |
| Private signing key remains on the server | `server/index.ts:17`, `src/services/api.ts:9`, `server/index.ts:39` | Supported for the application flow; operators must keep keys private |
| Device token uses protected phone storage | `src/services/api.ts:7`, `src/services/api.ts:9` | Supported: SecureStore, separate from financial export |
| Screenshot and recent-app protection | `src/ui/ScreenProtection.tsx:6`, `App.tsx:41` | Native prevention API and content gating implemented; device verification remains required |
| Example data is separate from personal data | `src/lib/workspace.ts:10`, `src/state/store.ts:41`, `src/lib/workspace.ts:43` | Supported: separate personal/example records and active-data selection |
| Pairing link works once and expires after two minutes | `server/pairing.ts:6`, `server/pairing.ts:7` | Supported: in-memory consume removes the issued ticket and checks age |
| Bank sign-in uses short-lived browser binding and one-use state | `server/index.ts:15`, `server/index.ts:26`, `server/index.ts:28`, `server/banking.ts:22` | Supported: signed cookie checks, Secure/HttpOnly/SameSite cookie, state compare-and-swap |
| No money is moved; bank refresh is manual | `server/index.ts:39`, `src/services/api.ts:12`, `src/services/useBanking.ts` | Supported: read-only account aggregation, explicit refresh; no payment endpoint |

## Decisions needed

* Required data-detail wording referred to bank login details. Code proves encryption of server connection credentials, not storage of bank passwords. Replaced that noun only.
* Backups contain free text. No implementation can promise that users never put a secret in a note. The backup help describes what Headroom adds and tells users that notes are included.
* Phone encryption is conditional platform behaviour, not something this repository enables or verifies. No claim of a verified phone configuration is made.
* Historical delivery reports retain their dates and proof boundaries. They are not evidence that this change has been tested on a device.
* Workstream 6 explicitly authorises its listed date-validation and feedback changes as narrow exceptions to the general text-only rule.

## Key rename map

Pending workstream 4.

## Output parity

Pending workstream 4. The comparison base will be the end of workstream 3, so intentional wording changes from the earlier workstreams are excluded.

## Verification

Baseline: typecheck passed; 245 tests passed with host access; Android export passed with host access. The sandbox test attempt failed on localhost and temporary-file permissions, not assertions.

Not run: device, emulator, TalkBack, font scale, live bank connection, deployed server or backup restore on Android.

Workstream 1: typecheck passed, 245 tests passed, Android export passed. Metro emitted a NO_COLOR/FORCE_COLOR environment warning.

Workstream 2: typecheck passed, 248 tests passed, Android export passed. One-off extraction preserved all 172 existing exact keys and their entry-point precedence in the regression fixture.

Workstream 3: typecheck passed, 248 tests passed, Android export passed with EXPO_OFFLINE=1 after a stalled network-enabled export was stopped. No dependency or export-script change.
