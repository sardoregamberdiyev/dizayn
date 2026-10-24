# Testing the coffee-store prototype

Install the frozen dependency tree with `npm ci` and use Node.js 22.12 or later. Tests run entirely against local demo data; no payment, email, or external account service is called.

## Commands

```sh
npm run typecheck
npm test
npm run test:e2e
npm run build
node tests/browser-audit.mjs
```

`node tests/browser-audit.mjs` runs an additional sweep of 45 routes at widths 375, 768, and 1440, checking headings, JavaScript exceptions, broken loaded images, and horizontal overflow. It starts a separate strict-port Vite server on port 5176 and stops that server after the audit. Pass route paths after the command to run a targeted sweep, for example `node tests/browser-audit.mjs /checkout /account`. Homepage review screenshots are written to `/tmp/coffee-home-desktop.png` and `/tmp/coffee-home-mobile.png`.

`npm test` runs the Vitest unit suite in `tests/store.test.ts`. `vitest.config.ts` keeps Playwright browser specifications out of the unit-test run.

`npm run test:e2e` starts Vite on port 5173, or reuses an existing development server when not running in CI. Playwright runs desktop Chromium (1440 × 1000) and mobile Chromium (iPhone-sized viewport) projects. A fresh isolated browser context is created for each test. Tests verify complete UI interactions and persistence across refresh; they do not rely on data left by a previous test.

System Chromium at `/usr/bin/chromium` is used when available. Otherwise install the standard Playwright browser with `npx playwright install --with-deps chromium`; the configuration automatically uses it. To choose a different browser installation, set its executable path:

```sh
CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

The browser runs headlessly with `--no-sandbox` for compatibility with the isolated cloud container. Use the normal browser sandbox when running in a production browser environment.

## Coverage

- Mixed-weight, mixed-origin cart pricing and bulk-weight discounts.
- Subscription unit-price rounding, including consistency between cart and invoice totals.
- Missing catalog entries, shipping charges, discount limits, and non-finite adjustments.
- Recovery from malformed persisted products, cart lines, orders, subscriptions, wishlist entries, profile, and currency.
- Desktop and mobile rendering without horizontal overflow.
- Catalog search/filtering, Java coffee variant selection, quantity, persistent cart, and demo checkout.
- Wishlist persistence and local administration product editing.
- Subscription activation after demo checkout, with persistent pause/resume controls.

Playwright saves traces for failed tests in ignored `test-results/`. To inspect a trace, run `npx playwright show-trace path/to/trace.zip`. Generated reports and build outputs are intentionally not tracked.

## Manual review

Check the supplied visual reference against the homepage at desktop and mobile sizes. Verify keyboard navigation through menu/search/cart drawers, Escape-to-close and focus restoration, reduced-motion preferences, empty states, form validation, and nested-route refreshes. Editorial photography and original packaging are local assets; a connection is not needed to load them after the application has been served.

Unit and browser checks validate the frontend prototype. They do not establish real payment processing, backend authorization, email delivery, a live exchange rate, or a published deployment. See the README and design document for integration boundaries.
