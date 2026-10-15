# Headroom for Android

<img src="assets/headroom-icon.png" alt="Headroom app icon" width="128" />

A separate personal finance app branched from Home Move Planner source commit
`a0f672d44636ec86850c5db9f35cb42d978680ed` on 15 October 2026.
The original hosted planner was read only and was not modified or deployed.

## What is implemented

- Native React Native / Expo Android interface with Today, Activity, Plan, Home and Accounts.
- Offline SQLite persistence for the budget, reviewed transactions and move scenario.
- Device API token in Android SecureStore; no Enable Banking private key in the app.
- Live supported-bank discovery, browser consent, transaction refresh and disconnection through a separate personal API service.
- Stable-reference duplicate protection and preserved human review on subsequent imports.
- Explicit purchase, income, refund, transfer, repayment and unreviewed classifications.
- Transparent wellbeing score, comfort band and monthly debt/cash/goal/investment allocations.
- Required mortgage, SDLT, sale proceeds, exchange timing, fees, LTV and rate stress tests using the existing pure TypeScript engines.
- Example mode is explicitly labelled and cannot import real bank data.

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
6. In the Android Accounts screen, enter the HTTPS API origin and DEVICE_TOKEN.
   Choose Check bank coverage, authorise an available bank in your browser,
   return to the app, then Refresh transactions.
7. Classify imports in Activity. Enter or update the monthly baseline in Plan.

Zopa, Starling, Lloyds credit card and Amex coverage is **not confirmed**. The live
Enable Banking list, your application permissions and your exact account/card
product determine what works. There is no invented connection status.
Provider transactions are filtered to booked GBP items with stable IDs; the
server reports omitted or incomplete imports and limits history to 180 days.
Refresh is manual in this version. It does not run scheduled background imports.

The backend is personal, single-owner software with a high-entropy device token.
It has no multi-user registration. Do not distribute one person's token or
Enable Banking credentials to other people. Each deployment needs its own setup.
No credentials are embedded in the APK or committed to source.

## Ratings and suggested amounts

The score is an app-defined planning heuristic, not a credit-bureau score,
a lender decision, an audited financial assessment or an investment suitability test.
It is withheld until all account coverage is confirmed by the user and at least
three complete months have been reviewed. That confirmation is manual.

Score: emergency cash resilience 35 points, monthly surplus margin 35 points,
non-mortgage debt 30 points (15 for debt below 8% APR, 0 at/above 8%).
Comfort bands use surplus/income: negative = Over budget, under 10% = Tight,
under 20% = Manageable, otherwise Comfortable.

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
Deleting local data clears the device plan and transactions, but does not
revoke provider consent. Forgetting the API token only unpairs this device.
To remove all server records after disconnecting, stop the server and delete its
private data directory, key file and managed secrets according to your backup policy.

The native app has not been run in an emulator or on a physical phone here.
Live bank authorisation has not been tested. No APK is included in this archive.
No push notifications, background jobs, payments, investment execution,
credit-bureau integration, CSV import UI or automated transfer matching yet.
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

Verified here: TypeScript check passed, 62 tests passed, Expo dependency versions
matched the installed SDK, and the Android Hermes bundle exported successfully.
The native SDK build, APK workflow and live-bank tests remain unverified.

Tests cover legacy financial calculation parity, SDLT bands, mortgage and budget
calculations, allocation conservation, investment gating, duplicate imports,
review retention, transfer/repayment exclusions and API authentication boundaries.
