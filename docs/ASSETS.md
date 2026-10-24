# Visual asset provenance

All website images are retained locally in `public/images`; the running application does not require third-party image hosts.

## Original package illustrations

`java-bag.svg`, `sumatra-bag.svg`, `bali-bag.svg`, `toraja-bag.svg`, `signature-bag.svg`, and `espresso-bag.svg` are original, code-authored vector artwork created for this project. Their folded pouch silhouettes, shading, botanical rosettes, coffee bean motifs and COFFEE SHOP marks were drawn specifically for this implementation. They do not reproduce the third-party logos or figurative package illustrations visible in the supplied visual reference. SVGs include descriptive accessible titles through their `aria-label` attributes; React product images also supply contextual alternative text.

## Original generated hero packaging

`sumatra-hero.webp` and `java-hero.webp` are original native-image-generated product concepts with true RGBA transparency, optimized as WebP (quality 90) for web delivery. They depict premium folded matte-black coffee pouches, terracotta and slate-blue labels, and original botanical artwork. They are used for the prominent hero composition; the vector variants remain available for lighter product-card and fallback rendering. No third-party brand marks or reference package art were extracted.

## Original generated editorial imagery

The following images were generated specifically for this project using the native image generation tool, then encoded as JPEG for web delivery:

| File                  | Subject                                                      |
| --------------------- | ------------------------------------------------------------ |
| `coffee-beans.jpg`    | Roasted arabica bean macro, warm espresso lighting           |
| `coffee-farm.jpg`     | Illustrative Indonesian-inspired coffee plantation landscape |
| `coffee-roasting.jpg` | Specialty coffee roastery cooling tray                       |

These are illustrative brand concepts, not evidence of a real farm, supplier or roastery. Do not attribute the generated landscapes to a specific actual grower or geographic site.

## Public-domain photograph

`coffee-cup.jpg` is the `coffee.png` reference photograph from scikit-image v0.18.3, courtesy of Pikolo Espresso Bar. The photographer is **Rachel Michetti**, and the upstream documentation explicitly releases the photograph under **CC0**, with no copyright restrictions.

- Original asset: https://raw.githubusercontent.com/scikit-image/scikit-image/v0.18.3/skimage/data/coffee.png
- License statement: https://github.com/scikit-image/scikit-image/blob/v0.18.3/skimage/data/__init__.py#L934-L950

The photograph was re-encoded as JPEG, with its composition unchanged.

## Compatibility aliases

`beans.jpg`, `brewing.jpg`, and `origin.jpg` are byte-identical aliases of `coffee-beans.jpg`, `coffee-cup.jpg`, and `coffee-farm.jpg`, respectively. They support the editorial content records without any runtime external fetches.

## Reference and network notes

The user's reference image guided layout, typography hierarchy, palette and editorial composition. It is not embedded as a full-page image, and no third-party reference package graphics were extracted. Unsplash and Pexels asset endpoints were unavailable in the build environment (proxy CONNECT 403), so the implementation uses original generated art and a documented public-domain photo instead. TLS verification remained enabled throughout.

## Self-hosted fonts

Anton, Manrope, and Kaushan Script are bundled locally in `public/fonts` from the official Google Fonts repository. Each is distributed under the SIL Open Font License; the corresponding OFL license files are included alongside the fonts. The application makes no external font requests.

- https://github.com/google/fonts/tree/main/ofl/anton
- https://github.com/google/fonts/tree/main/ofl/manrope
- https://github.com/google/fonts/tree/main/ofl/kaushanscript
