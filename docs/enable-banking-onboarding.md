# Enable Banking setup in Headroom

Open Accounts → Set up banking. The five-step guide explains API setup, your private server, pairing, bank consent, then import/review. It opens at the next useful step based on verified connection status. Example mode permits reading the guide but disables real-bank actions.

## 1. Register an API application

Use [Enable Banking sign-in](https://enablebanking.com/sign-in/) and its Control Panel. Follow the [official quick start](https://enablebanking.com/docs/api/quick-start/). Register your application, retain its ID and downloaded private key privately, and register the exact callback URL. Sandbox is for provider testing; personal Headroom imports require an active Production application. Follow the Control Panel's current account-linking/activation requirements; production permission and bank coverage are not guaranteed by registration alone.

## 2. Configure the private finance server

The current app uses an owner-managed Node service. It is not a hosted multi-user banking service. The server holds the private key, signs provider requests, receives bank callbacks and encrypts its stored provider data. Do not paste the private key into the phone, a chat or Git.

Follow [Configure real bank access](../README.md#configure-real-bank-access) and `server/.env.example`. Required owner configuration includes an HTTPS public origin, independent device/storage secrets, a persistent private data directory, application ID, private-key file path and Production mode. Keep the private key outside the repository. Back up the encryption key securely; generating a new key is not a recovery procedure for old encrypted data.

In the in-app guide, enter the server's HTTPS origin to preview the exact callback `https://YOUR-SERVER/api/banking/callback`. The preview rejects URLs with paths, embedded credentials, queries or fragments. Previewing a URL does not deploy, activate or configure anything. Register this exact callback on the Enable Banking application. On startup the server validates activation, environment and callback configuration.

There is currently no deployed server or configured Enable Banking application in this checkout. These owner steps must be completed before a live bank pass can run. The app's guide and state handling can be tested without them; genuine consent and data retrieval cannot.

## 3. Pair the phone

With the server running and its environment loaded, its owner runs `npm run pair-device`. Paste the resulting one-use link into Settings → Link this phone → One-use linking code and choose Link this phone within two minutes. This pairs the phone with the server; it does not authorise any bank. Keep the link private and request another if it expires. The device token is stored in Android SecureStore. Pairing failure must not be presented as bank refusal.

## 4. Authorise the bank

In the guide's Connect a bank step choose Find supported banks. Search the live bank list for your exact institution/product, choose Connect, and complete the bank/provider browser consent flow. Bank credentials go to the bank, not Headroom. Returning to the app triggers a status check; incomplete or cancelled consent must not be shown as success. Expired consent requires a fresh authorisation. Verify the new connection before removing the old one.

## 5. Import and review

Choose Refresh transactions, then review the imported rows in Activity. Check the import receipt for partial/failed banks and confirm coverage against statements. The current implementation requests up to 180 days and imports booked GBP transactions with stable references. It excludes unsupported currencies and pending items, does not fetch live balances, does not schedule refreshes, and does not replace the confirmed Plan. Manual account balances and CSV fallback remain available.

Live acceptance requires a real configured application/server and the account holder's consent. Verify supported-bank discovery, exact product coverage, cancellation, callback return, refresh, duplicate protection, partial/failure receipts, consent expiry and disconnection. Unit tests or a sandbox fixture alone do not establish live-provider parity.
