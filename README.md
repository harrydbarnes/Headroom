# Headroom for Android

<img src="assets/headroom-icon.png" alt="Headroom app icon" width="128" />

A separate personal finance app branched from Home Move Planner source commit
`a0f672d44636ec86850c5db9f35cb42d978680ed` on 15 October 2026.
The original hosted planner was read only and was not modified or deployed.

Current source baseline: **0.2.3**. The unreleased account/ledger work and open release checks are recorded in [priority 0-1 delivery evidence](docs/priority-0-1-delivery-2026-10-16.md). See [P1 before/after and remaining release checks](docs/p1-completion-2026-10-15.md).

## What is implemented

- Native React Native / Expo Android interface with Today, Activity, Plan, optional Move, Accounts and dedicated Settings.
- Resumable manual onboarding and isolated personal/example datas.
- Searchable transaction review with categories, filters, bulk actions, merchant rules and undo.
- Manual cash/unsupported-account entries and explicit past-month coverage attestations.
- Multiple named debts/goals, reviewed actuals versus plan and user-approved baseline updates.
- Editable move assumptions, saved scenarios and gated post-move budget comparisons.
- Light/dark/system themes, optional Android 12+ wallpaper colours, labelled icon navigation, adaptive rail and reduced-motion-aware transitions.
- Device authentication lock, hide-amount controls, screen protection and validated personal backup/restore.
- Offline SQLite persistence for the budget, reviewed transactions and move scenario.
- Device API token in Android SecureStore; no Enable Banking private key in the app.
- Live supported-bank discovery, browser consent, transaction refresh and disconnection through a separate personal API service.
- Stable-reference duplicate protection and preserved human review on subsequent imports.
- Explicit purchase, income, refund, transfer, repayment and unreviewed classifications.
- Transparent wellbeing score, comfort band and monthly debt/cash/goal/investment allocations.
- Required mortgage, SDLT, sale proceeds, exchange timing, fees, LTV and rate stress tests using the existing pure TypeScript engines.
- Example mode is explicitly labelled, has fictional review transactions, cannot import real bank data and uses a separate persisted workspace that preserves your data.

This is a runnable first implementation, not an already installed or published Android app.
No bank credentials, live account balances or transaction history have been copied from the website.
The house screen contains labelled planner defaults which need confirmation.

## Run on Android

Use Node 24 and a supported Android phone or emulator.

```sh
npm ci
npx expo start
```

Open using the matching Expo Go release, or generate a development build.
For a local installable debug APK with Android SDK installed:

```sh
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.
Alternatively place this project at the root of a GitHub repository and run the
included **Build Android preview** workflow; download its APK artifact.
That workflow has been supplied but has not been executed here.
For EAS, sign into your own Expo account then run:

```sh
npx eas-cli build --platform android --profile preview
```

The Android preview profile builds an APK; production builds an AAB.
Production signing and Play Console publication require your accounts and setup.

## Configure real bank access

Accounts > Set up banking now walks through registration, private-server setup, phone pairing, bank consent and import. See the [guided setup checklist](docs/enable-banking-onboarding.md).

The mobile app uses its own API server. It does not reuse ChatGPT website cookies
or the website's encrypted credentials. Keep the website configuration intact.

1. Host `server/index.ts` on a private Node 24 service behind a real HTTPS reverse
   proxy. It listens on loopback by default. Keep a single process, a persistent
   data volume and secure backups of your encryption key. No ephemeral filesystem.
2. Add `https://YOUR-API-HOST/api/banking/callback` to your Enable Banking API
   application's allowed redirect URLs. Keep the existing planner URL too.
3. Set the variables in `server/.env.example` in the server's environment. Generate
   DEVICE_TOKEN and BANKING_ENCRYPTION_KEY independently with
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
4. Store your existing PKCS#8 private key outside the project and set its absolute
   path as ENABLE_PRIVATE_KEY_PATH, alongside your application ID. On first start,
   the server validates the application, environment, activation and callback URL.
   Subsequent starts reuse its encrypted stored configuration.
5. Start with `npm run server`. Supply environment variables via your host's
   secret manager; the example file is not loaded automatically.
6. Run `npm run pair-device` in the server environment with PUBLIC_ORIGIN and
   DEVICE_TOKEN set. It requests a pairing link from your running Headroom server.
   Keep the pairing link private. It works once and expires after two minutes.
   Paste it into Settings > Link this phone > Pairing link, then choose Link this
   phone. Alternatively choose Enter details manually for the server address and
   device token.
   The Enable Banking private key never belongs on the phone.
7. In Accounts choose Find supported banks, search for your bank and authorise it
   in the browser. The completion page distinguishes success from cancellation
   and offers Return to Headroom. Check status after returning, then Refresh
   transactions. Status refresh also runs on app resume.
8. Review imports in Activity. Confirm each past month's coverage only after
   checking full statements, cash and unsupported accounts. Enter and confirm
   the future monthly baseline in Plan. Imports never silently replace it.

Zopa, Starling, Lloyds credit card and Amex coverage is **not confirmed**. The live
Enable Banking list, your application permissions and your exact account/card
product determine what works. There is no invented connection status.
Provider transactions are filtered to booked GBP items with stable IDs; the
server reports omitted or incomplete imports and limits history to 180 days.
Refresh is manual in this version. It does not run scheduled background imports.

The backend is personal, single-owner software with a high-entropy device token.
It has no multi-user registration. Do not distribute one person's token or
Enable Banking credentials to other people. Each deployment needs its own setup.
Keep credentials out of the APK and source. Configure server secrets on your host.

## Ratings and suggested amounts

The score is an app-defined planning heuristic, not a credit-bureau score,
a lender decision, an audited financial assessment or an investment suitability test.
It is withheld until the baseline and all-account coverage are confirmed and at
least three completed past months have been explicitly confirmed in Activity with
no unreviewed rows. Month completeness is a manual attestation, not an inference
from transaction date ranges. Changed imports/reviews invalidate affected month
confirmations; identical reimports retain them. Old typed month counts are not
migrated as verified coverage.

Score: emergency cash resilience 35 points, monthly surplus margin 35 points,
non-mortgage debt 30 points (15 for debt below 8% APR, 0 at/above 8%).
Comfort bands use surplus/income: negative = Over budget, under 10% = Tight,
under 20% = Manageable, otherwise Comfortable.

Named debts are assessed separately. Named goal monthly needs are combined into
a funding pool that the user chooses how to divide.
Positive monthly surplus is allocated in this order: extra repayment of debt at
8% APR or above, emergency fund shortfall, timed savings goal, then an editable
share of the remainder for possible investing. Investing is shown only if there
is no non-mortgage debt, the emergency target is met, the goal is funded on time
and the investment horizon is at least five years. Funds already held for a goal
are separate from emergency cash. Minimum debt payments belong in essentials;
the allocation shows additional repayments only. No money is moved.

These thresholds are explicit product choices. The default emergency target is
three months of essential spending. The app provides educational planning
amounts, not recommended securities or promised returns. Market prices,
credit-bureau scores, pensions and investment balances do not arrive through
the banking integration.

Guidance consulted 15 October 2026:
- https://www.moneyhelper.org.uk/en/savings/investing/thinking-about-investing-make-sure-you-understand-the-risks
- https://www.moneyhelper.org.uk/en/savings/investing/investing-beginners-guide
- https://www.gov.uk/stamp-duty-land-tax/residential-property-rates
- https://enablebanking.com/docs/api/reference/
- https://docs.expo.dev/versions/latest/

## Data, privacy and current limits

Use Settings > Backup and restore to export personal financial data. On Android,
choose a folder using the system picker; the app writes readable JSON there.
Keep it private. Restore validates the file and asks before replacing your
data. Headroom does not add pairing or server credentials to backups. Your notes
are included, so keep secrets out of them. Backups include
the plan, transactions, rules, coverage and move scenarios. The format limit is
20 MB and 100,000 transactions. Exported files remain until you delete them.

Use Settings > Privacy for optional device authentication and screen-capture
protection. Biometrics must be enrolled before enabling the lock; authentication
can use device credential fallback. Summary hiding leaves editable fields visible.
App lock does not additionally encrypt SQLite. Screen protection uses Android's
secure-window flag and needs native device verification.

The Android budget and transactions are stored in app-private SQLite, without
additional database encryption in this version. Device security protects the
app sandbox. Android cloud backup is disabled. The paired device token uses
SecureStore. The server encrypts provider credentials, sessions and cached
transactions with AES-GCM and record-specific authenticated data.

Bank consent uses a short-lived one-use launch ticket, a Secure/HttpOnly
SameSite cookie and a one-use provider state value. Configure the reverse proxy
not to log callback query strings, launch tickets, bodies or authorisation
headers. Use HTTPS, access controls, patching and disk protections on that host.

Disconnecting revokes that provider session and deletes its server cache.
Deleting current data clears its plan, transactions, coverage, rules and move
scenarios, but does not revoke provider consent. Older migration recovery records
on the phone and exported backups remain. Personal and example deletion
are separate. The old house key is removed after migrated state is saved. Forgetting the API token only unpairs this device.
To remove all server records after disconnecting, stop the server and delete its
private data directory, key file and managed secrets according to your backup policy.

The native app has not been run in an emulator or on a physical phone here.
Live bank authorisation has not been tested. No APK is included in this archive.
No push notifications, background jobs, payments, investment execution,
credit-bureau integration or CSV import UI. Transfer suggestions require human
confirmation. A unique two-sided match can be explicitly confirmed with a preview and undo; ambiguous matches stay unresolved.
The existing CSV/reconciliation calculator modules are retained for future work.
The plan is not silently overwritten by provider imports: reviewed actuals
and the manually confirmed future budget remain separate.

## Verification

```sh
npm run typecheck
npm test
EXPO_OFFLINE=1 npx expo install --check
EXPO_OFFLINE=1 npm run export:android
```

For the 0.2.3 P3 implementation: TypeScript and 143 tests passed. Shared motion,
typography, adaptive summaries/dialogs and the full fictional walkthrough are implemented.
See docs/p3-completion-2026-10-15.md for before/after and native acceptance checks.

For the earlier 0.2.2 P2 implementation: TypeScript passed, 130 tests passed and the Android
Hermes bundle exported. See docs/p2-completion-2026-10-15.md for before/after,
migration behaviour and outstanding device/live-service acceptance checks.

For the earlier 0.2.1 P1 implementation: TypeScript passed, 113 tests passed, Expo dependency
versions matched the installed SDK and the final Android Hermes bundle exported.
See docs/p1-completion-2026-10-15.md for the P1 map, before/after and native acceptance checks.
The native SDK build, APK workflow, visual/device checks and live-bank tests remain
separate verification requirements.

Tests cover legacy financial calculation parity, SDLT bands, mortgage and budget
calculations, allocation conservation, investment gating, duplicate imports,
review retention, transfer/repayment exclusions and API authentication boundaries.

## Period budgets, bills and pension matching

Plan now includes period budgets, custom categories and manual pension matching; Plan/Activity include confirmed bills, expected refunds and planning forecasts. See [usage, financial assumptions and verification boundaries](docs/priority-2-3-delivery-2026-10-17.md). These local tools work without a bank connection and do not execute payments or payroll changes.
