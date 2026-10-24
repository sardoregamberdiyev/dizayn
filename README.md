# COFFEE SHOP

A responsive, Indonesian-inspired specialty coffee storefront and administration **frontend demo**. The art direction follows the supplied coffee-store reference: warm paper, espresso tones, expressive type, original illustrated packaging, and editorial photography.

## Run locally

Requires Node.js 22.12+ (tested with Node.js 24) and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. To create and serve the production build:

```sh
npm run build
npm run preview
```

## What works

- Responsive homepage with three hero states, editorial sections, a flavour explorer, and product discovery.
- Searchable, filterable catalog; product variants, quantity controls, wishlist, and a mini-cart/full cart.
- Guest demo checkout, local order confirmation and order history.
- Account/profile interfaces and locally managed coffee subscriptions.
- Collections, origins, journal articles, brand story, contact, and help pages.
- Separate administration interface for local catalog, inventory, and order management.
- Keyboard focus states, labelled controls, reduced-motion support, and USD/UZS display.

The store is deliberately a browser-based prototype. Cart, wishlist, catalog edits, orders, demo profile, and subscriptions use namespaced `localStorage` on the current browser. Reset site storage to return to the original sample catalog. Storage is not shared across devices or users.

**No real payments are processed.** Account access is a demo profile, not secure authentication. The admin interface is openly accessible for reviewing the prototype and must be protected by server-side authorization before any real deployment. Contact/newsletter confirmations are local interactions; they do not send messages or email. Prices, customer counts, reviews, and business details are sample content. UZS display uses a fixed illustrative conversion rather than a live exchange rate.

## Routes

| Area | Routes |
| --- | --- |
| Discovery | `/`, `/shop`, `/search`, `/collections`, `/collections/:slug`, `/origins`, `/bundles` |
| Shopping | `/product/:slug`, `/wishlist`, `/cart`, `/checkout`, `/order-success` |
| Content | `/about`, `/journal`, `/journal/:slug`, `/contact`, `/help` |
| Account | `/account/auth`, `/account`, `/account/orders`, `/account/orders/:id`, `/subscription` |
| Administration | `/admin` and the administration navigation tabs |

## Validation

```sh
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Browser tests use system Chromium at `/usr/bin/chromium` when available, or Playwright’s downloaded Chromium otherwise (`npx playwright install chromium`). Set `CHROMIUM_PATH` to use another executable. See [testing instructions](docs/TESTING.md) for coverage and troubleshooting.

## Structure and handoff

- `src/data.ts` — sample catalog, articles, collections, and variant weights.
- `src/store.tsx` — persistent demo state, cart/invoice calculations, orders, and subscriptions.
- `src/components/` — shared navigation and interface components.
- `src/pages/` — storefront, content, account, and administration screens.
- `public/images/` — local packaging artwork and editorial assets.
- [Design and interaction specifications](docs/DESIGN.md) — sitemap, journeys, visual system, responsive rules, motion, and production boundaries.

The deliverable is an implemented web application and developer documentation. A native Figma file is not included.

## Hosting

The production output is `dist/`. Deploy it to a static host configured to serve `index.html` for application routes that are not files; otherwise refreshing a nested URL such as `/product/java-arabica` can return a 404. Vite's preview server handles these routes for local review.

Pushing this repository to GitHub does not publish a website. GitHub Pages additionally requires a matching Vite base path and an SPA fallback strategy; use a host with rewrite support or configure those explicitly. Before a real launch, connect a backend, inventory source, payment provider, transactional email, secure authentication, and protected admin APIs, and replace sample commerce policies and business content.
