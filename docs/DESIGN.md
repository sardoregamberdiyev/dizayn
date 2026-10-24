# COFFEE SHOP — developer handoff

## Product and delivery scope

An Indonesian-inspired specialty-coffee storefront with a separate administration workspace. The supplied reference establishes the editorial composition and visual rhythm; all illustrated packaging is original. The website fills the browser with warm ivory rather than reproducing the reference's outer presentation canvas.

This repository is a runnable React/TypeScript frontend prototype. Catalog edits, cart, wishlist, demo account, orders, and subscriptions use local browser persistence. Checkout creates a demonstration order: it does not charge money, transmit card details, send email, or establish production authentication. Administration is a local demonstration interface, not a protected server boundary. A backend, identity provider, inventory system, shipping integration, and payment provider are required before commercial deployment. No Figma file is generated; this document and the reusable implementation provide the design handoff.

## Art direction

- Warm textured ivory surfaces, espresso/burgundy feature areas, and restrained coral-red accents.
- Oversized expressive hero lettering combined with condensed editorial headlines and readable sans-serif interface text.
- Sculptural Java and Sumatra packages overlap the hero composition; original botanical/geometric illustration supplies the packaging identity.
- Pill navigation and purchase controls, generous editorial spacing, rounded photography, asymmetric features, and minimal line icons.
- Product presentation alternates with editorial stories and origin content instead of repeating identical grids throughout the homepage.

## Sitemap

| Route | Purpose |
| --- | --- |
| `/` | Editorial homepage, hero product discovery, featured products and stories |
| `/shop` | Searchable, sortable and filterable catalog |
| `/collections` | Curated coffee collections |
| `/collections/:slug` | Collection story and relevant products |
| `/product/:slug` | Product gallery, variants, tasting information and purchase controls |
| `/bundles` | Coffee bundle discovery |
| `/origins` | Growing-region discovery and origin information |
| `/wishlist` | Saved products |
| `/search` | Search results and empty-result recovery |
| `/cart` | Editable line items, coupon, shipping estimate and totals |
| `/checkout` | Contact, address, delivery and demonstration order review |
| `/order-success` | Demonstration order confirmation |
| `/account/auth` | Local demo login, registration and password-recovery presentation |
| `/account` | Profile and subscription management |
| `/account/orders` | Locally saved order history |
| `/account/orders/:id` | Order contents, status and tracking presentation |
| `/subscription` | Coffee preference, weight and delivery-frequency selection |
| `/about` | Brand story and sourcing philosophy |
| `/journal` | Editorial listing and category discovery |
| `/journal/:slug` | Reading experience and related coffee discovery |
| `/contact` | Validated demonstration contact form and support information |
| `/help` | Searchable shipping, returns, payment and coffee FAQs |
| `/admin/*` | Overview, analytics, orders, products, inventory, customers, promotions, reviews, content, subscriptions and settings |

The primary navigation exposes shopping and storytelling destinations. Account, wishlist and cart remain available globally. Product and article links use their explicit detail routes; an unknown resource must provide a useful recovery path.

## Main journeys

1. **Purchase:** Home → Shop → origin/roast/search filters → Product → choose weight/grind/quantity → Add to Cart → Cart → Checkout → valid contact/address/delivery selection → review demo order → confirmation → order details.
2. **Discovery:** Home → Search → matching product → Product → Wishlist → Wishlist or local Account. Empty searches offer catalog recovery.
3. **Account:** Register or local demo login → Account → profile editing → Orders → Order details. Recovery screens must explain the frontend-only scope and avoid pretending an email was delivered.
4. **Subscription:** Subscription → coffee preference → package weight/frequency → review → cart/checkout → Account subscriptions → pause, resume or cancel.
5. **Editorial:** Home story card → Journal → category/article → related coffee → Product.
6. **Administration:** Demo admin workspace → product list → add/edit product → inventory → orders → change status → customer-facing order detail reflects the saved local status.

## Design foundations

| Semantic role | Color | Use |
| --- | --- | --- |
| Primary accent | `#E13B32` | Brand graphics, prominent controls and accents |
| Espresso | `#211315` | Dark hero and deep surfaces |
| Burgundy | `#33191D` | Secondary dark features |
| Background | `#F6F4EF` | Main warm ivory canvas |
| Surface | `#FFFFFF` | Inputs, cards and elevated controls |
| Primary text | `#191719` | Readable copy and headings |
| Coffee | `#80513C` | Supporting coffee-tone surfaces |
| Caramel | `#D8A574` | Decorative highlights and packaging details |
| Muted reference tone | `#8B8581` | Decorative/subtle details; verify contrast before using for body text |
| Success | `#286246` | Successful actions and available status |
| Warning | `#8A570C` | Inventory and attention states |
| Error | `#B62B25` | Validation and destructive action feedback |

Tokens describe semantic intent; readable text must meet WCAG AA against its actual background. Red/ivory combinations and muted small copy require measured contrast and, when needed, a darker functional variant. Never communicate status through color alone.

Use expressive display lettering only for short decorative hero phrases. Condensed uppercase headings carry the editorial hierarchy. Interface and body copy use the sans-serif family. Maintain one semantic `h1` per route and a consistent `h2`/`h3` hierarchy independent of visual font size.

Spacing follows a 4px base with 8/12/16/24/32/48/64/96px intervals. Prefer 16–24px card gaps and 48–96px section spacing on desktop; reduce intentionally for mobile. Pill controls use fully rounded ends, feature cards use approximately 24–40px corners, and fields use smaller consistent radii. Shadows express product depth or elevation, not decoration on every container.

## Responsive layout and wireframe structure

Validate at 375, 390, 430, 768, 1024, 1280, 1440 and 1920px widths.

| Size | Structural treatment |
| --- | --- |
| 1280–1920 | Airy horizontal header, 12-column editorial rhythm, layered hero packages, multi-column shop and two-column product/checkout layouts |
| 768–1024 | Condensed navigation, reduced hero lettering, deliberately repositioned package art, two-column catalog and adapted sidebar controls |
| 375–430 | Compact header with accessible menu, recomposed hero, comfortable 44px targets, single-column editorial/checkout layouts and compact product grids |

Wireframe order is consistent: header → route title or primary feature → task controls → main content → contextual recommendations → newsletter/footer. Product pages place identity and purchase decisions before detailed editorial information on narrow screens. Checkout keeps the summary available without obscuring form fields. Administration prioritizes its current task and makes dense tables horizontally scrollable within their own container rather than overflowing the entire viewport.

No content may require desktop hover to become available. Images retain meaningful crop positions and reserved dimensions. Prevent horizontal page overflow, overlapping controls and decorative text covering navigation.

## Reusable component contract

- **Navigation:** global header, menu drawer, account menu, footer and breadcrumbs.
- **Controls:** primary/outlined buttons, icon buttons, labeled inputs/selects, quantity stepper, tabs, sort/filter controls and accordions.
- **Commerce:** product card, price, variant selection, stock/roast indication, wishlist control, cart line, order summary, coupon feedback and empty state.
- **Editorial:** section heading, story card, origin card, article layout and image/text feature.
- **Feedback:** visible focus, validation message, toast/status notification, modal/drawer, loading treatment and confirmation state.
- **Administration:** sidebar navigation, metrics, charts, searchable data tables, status badge and product editor.

Use meaningful accessible names for icon-only controls. A disabled purchase action must explain the prerequisite. Empty states should identify the missing content and offer a relevant next action. Currency display is configurable for USD and UZS; the selected currency must remain consistent across product, cart and order surfaces.

## Interaction and motion

Microinteractions primarily animate `transform` and `opacity` for 150–350ms with a smooth ease-out curve. Product hover may lift the package slightly; editorial photography may gently zoom inside its clipped frame. Hero transitions can be more expressive but cannot block purchase controls. Avoid animation that changes layout continuously or steals focus.

Respect `prefers-reduced-motion`: remove floating/parallax effects and use immediate or minimal transitions. Carousel state needs explicit controls and an accessible current-state indication; gesture support supplements controls. Drawers and dialogs must support Escape, retain an obvious close action and restore focus appropriately. Navigation changes should return the user to a sensible top-of-page position.

## Accessibility and validation checklist

- Semantic landmarks, descriptive links, ordered headings and meaningful image alternatives.
- Visible keyboard focus; keyboard-operable menus, forms, accordions, variants and quantity controls.
- Persistent labels, suitable input types/autocomplete and inline error messages connected to their fields.
- Tap targets approximately 44×44px where practical; no hover-only essential content.
- Screen-reader-readable notifications and cart counts; status labels in addition to color.
- Checkout rejects incomplete/invalid data, preserves entered details and never requests real card secrets in the demo.
- Cart and wishlist survive refresh; variant combinations remain distinct line items; quantities and totals update together.
- Confirm supported responsive widths, reduced motion, empty states, unknown routes/resources and the full successful demo-order journey.

## Production integration boundary

Replace local persistence with authenticated API-backed resources before launch. Server-validate prices, coupons, stock, order totals and authorization. Payment details belong in a payment provider's secured flow; never collect or persist them in local storage. Protect admin routes and mutations on the server. Add transactional email, privacy/consent controls, monitoring, localization and real fulfillment tracking according to the deployment requirements.
