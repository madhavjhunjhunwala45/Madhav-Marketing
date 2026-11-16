# Madhav Marketing — engineering and visual audit

16 November 2026. Based on the supplied repository ZIP, three Search Console screenshots, the supplied deployment history, and the 45.64-second screen recording. No production deployment or external-account changes were made.

## Outcome

- Every actual product now has Product Offer data derived from the real rupee prices in store-config.mjs. Currency is INR and offer URLs use the canonical product URL. The two oil sizes have their own real offers and both prices are visible on the product page.
- Product prices, product/card cart controls and the header cart link are present in generated HTML. The cart reuses them and binds each action once instead of inserting a second set after loading. JavaScript-disabled pages still show prices, product data and enquiry/Amazon links; cart buttons wait for JavaScript.
- No price was changed or multiplied by 100. Existing cart conversion to paise is unchanged. No stock status, review, rating, discount expiry, manufacturer or medical claim was invented.
- Removed repeated desktop action-bar viewport measurements, unrelated root-class feedback, and redundant English language application. Initial homepage CSS now includes the nearby catalogue, principle band and cart-badge geometry to reduce delayed-stylesheet shifts.
- Product rendering has a duplicate-initialization guard and safe text updates. Gallery, composition, language, menu and cart controls remain functional.
- Replaced the novelty leaf cursor with native browser/input cursors. Retained the existing palette, typography, pack photographs, layout, subtle feedback and reduced-motion support.
- Added explicit homepage redirects before the existing path rules for both old .store hosts, the new non-www .in host and the old Vercel hostname. Paths and query strings retain their values. The primary www .in host has no redirect loop. The generator and vercel.json match.
- Kept the 110-URL canonical sitemap and updated its content-change date. Cart, pack/language duplicates and internal generated paths remain excluded.
- Corrected outdated deployment documents that incorrectly said no build was required and checkout was only a Coming soon placeholder.

## Runtime correction

Pinned package.json, package-lock.json and .nvmrc to Node.js 24.x. Node 20 cannot satisfy the request for a currently supported Vercel runtime: Vercel disabled Node 20 for new deployments on 1 October 2026. Validation used Node v24.22.1. The existing dependency versions were retained; the lockfile dependency tree is unchanged.

Official reference: https://vercel.com/changelog/node-js-20-is-being-deprecated

## Changed files

- `.nvmrc` — Local Node 24 selection.
- `CLEANUP-REPORT.txt` — Mark old no-build/checkout instructions as historical without removing the report.
- `EDITING-GUIDE.md` — Current single-price-source and build/editing workflow.
- `EXPORT-NOTES.md` — Clarify that the ZIP is buildable source, not a ready-made no-build static export.
- `README.md` — Accurate install, build, test, preview and Vercel instructions.
- `mm-polish.js` — Avoid desktop geometry reads and root-class feedback; preserve mobile keyboard handling.
- `package-lock.json` — Matching root engine; unchanged dependency versions.
- `package.json` — Supported Node range and complete test command.
- `product-page.js` — Duplicate initialization guard and safe text setter.
- `scripts/build-search.cjs` — Use price source/display renderer, synchronized redirects and current content date.
- `scripts/check-search.cjs` — Validate real offers against actual prices and canonical URLs.
- `scripts/optimize-output.cjs` — Include first-screen catalogue/band/badge geometry in initial CSS.
- `scripts/store-display.cjs` — Build visible prices, stable cart controls and public price data from store-config.mjs.
- `search.js` — Real Offer data and browser/schema price synchronization.
- `shop.js` — Reuse server price/action nodes and bind once; retain rupee-to-paise conversion.
- `styles.css` — Native cursors, quiet pack-price presentation and tabular price figures.
- `tests/mm-polish.test.cjs` — Viewport-change keyboard regression.
- `tests/redirects.test.cjs` — Forty HTTP/HTTPS/root/path/query routing contracts, no loops and matching build configuration.
- `tests/seo.test.cjs` — Require real offers rather than forbid offers.
- `tests/startup-layout.test.cjs` — No hidden desktop viewport reads, no class loop, critical CSS, duplicate product rendering.
- `tests/store-hydration.test.cjs` — Twenty source/bundled cases, eight languages, one listener/action and correct oil SKU/price.
- `tests/store-schema.test.cjs` — Seventeen product/pack HTML documents, exact prices, no invented fields, delayed-cart schema.
- `vercel.json` — Explicit homepage host redirects; preserves working path routes and security headers.

`AUDIT-REPORT.md` is the additional delivery report itself. No existing test or source asset was removed.

## Validation

The complete sequence was run in order, with all final checks passing:

```sh
npm ci --include=dev --ignore-scripts
npm run build
npm test
```

The build includes the full test suite; npm test was also run separately. The final update archive was extracted over a fresh copy of the supplied source and the sequence repeated there. Generated product HTML and JSON-LD were inspected. All 110 canonical pages/graphs, 17 product/pack documents, nine retail prices, sitemap URLs and internal references passed their checks. Every image inspected in generated HTML has an alt attribute; empty alts belong to decorative/closed-viewer or already-labelled thumbnail contexts.

Browser validation: 673 passing checks, no JavaScript exceptions and no unexpected missing local assets. Includes widths 320, 390, 768, 1440 and 1920; all eight products; both oil sizes; ingredient directory/profiles; category/contact/article/cart pages; every language; menu and filters; fixed carousel size; gallery button/Escape/outside closing and focus trapping; composition ARIA; missing-product fallback and unknown-product 404; visible prices without JavaScript; populated cart/enquiry values. Formspree responses were mocked; no real enquiry, WhatsApp message, email, order or payment was sent.

Touch checks used Chromium mobile emulation with native touch input, 4x CPU slowdown and a throttled connection: horizontal swipe changes one product, vertical swipe keeps normal scrolling, and one tap adds one selected 100 ml oil pack at the correct price. Actual physical iPhone/Android devices, Safari and Firefox were not available for direct testing.

Controlled loading comparison (400 ms delay on the cart module and full homepage CSS; same browser setup):

| Width | Supplied build CLS | Updated build CLS |
| --- | ---: | ---: |
| 1440 px | 0.015067 | 0.000301 |
| 768 px | 0.192964 | 0.018799 |
| 390 px | 0.010949 | 0 |
| 320 px | 0.013688 | 0 |

These are local observations, not a new live PageSpeed score or a guarantee of zero shift on every device. The public generated HTML/CSS/JS was byte-compared after the final routing-only change and matches the browser-tested output.

The recording was decoded without frame duplication: 1,994 source frames. Timestamped views and issue close-ups were reviewed. Its mobile TBT/forced-reflow warnings, desktop CLS, request chain and image-delivery diagnostics guided the focused loading fixes. Images were not broadly recompressed to chase an audit score; original quality and source/label files are preserved.

## Live redirect observations before deployment

- `http://madhavmarketing.store/` → 308 → `https://madhavmarketing.store/`.
- `https://madhavmarketing.store/` → 308 → `https://www.madhavmarketing.store/`.
- `http://www.madhavmarketing.store/` → 308 → `https://www.madhavmarketing.store/`.
- `https://www.madhavmarketing.store/` → 200 (no Location header).
- `https://www.madhavmarketing.store/?mm_audit=20261116` → 200 (no Location header).
- `https://madhavmarketing.store/product.html?product=hriday-rakshak&lang=hi` → 308 → `https://www.madhavmarketing.store/product.html?product=hriday-rakshak&lang=hi`.
- `https://www.madhavmarketing.store/product.html?product=hriday-rakshak&lang=hi` → 308 → `https://www.madhavmarketingayurveda.in/product.html?product=hriday-rakshak&lang=hi`.
- `http://madhavmarketing.store/product.html?product=hriday-rakshak` → 308 → `https://madhavmarketing.store/product.html?product=hriday-rakshak`.
- `http://www.madhavmarketing.store/product.html?product=hriday-rakshak` → 308 → `https://www.madhavmarketing.store/product.html?product=hriday-rakshak`.
- `https://madhavmarketingayurveda.in/` → 308 → `https://www.madhavmarketingayurveda.in/`.
- `https://www.madhavmarketingayurveda.in/` → 200 (no Location header).

The existing www .store homepage still returns 200, including a fresh query URL. Old apex requests also use an extra old-www hop. A product URL from old www does reach the correct .in path/query; the new non-www .in host redirects correctly. These observations do not prove which Vercel project/dashboard setting owns each domain. The code adds exact root coverage, but the live mismatch is not claimed fixed until the update is deployed and account settings are checked.

## Required manual Vercel/DNS steps

1. In the existing Vercel project, confirm all four domains are attached: madhavmarketing.store, www.madhavmarketing.store, madhavmarketingayurveda.in, www.madhavmarketingayurveda.in. Ensure an old domain is not assigned to a different project or an older production configuration.
2. Assign www.madhavmarketingayurveda.in to Production. Set the other three domains to permanently redirect to that exact host. Replace any dashboard redirect from old apex to old www with the new primary host. Do not redirect the new www host back to .store.
3. Check Valid Configuration and HTTPS for every domain. Where DNS needs correction, copy the exact A/CNAME values shown by this Vercel project into the authoritative DNS provider. Do not use a guessed generic IP and do not remove email MX/TXT or Google verification records. Repository edits do not control third-party DNS.
4. Set Vercel Build and Deployment Node.js Version to 24.x. Keep install command npm ci --include=dev --ignore-scripts, build command npm run build, output directory dist, and the correct root directory. Upload/commit the full related file set together.
5. After deployment, test HTTP and HTTPS for both old hosts, homepage and /product.html?product=hriday-rakshak&lang=hi. Confirm the final URL uses new www .in with the same product/lang parameters. A platform HTTP-to-HTTPS hop can occur before the canonical-host redirect. Keep the old domain registered and redirecting.

## Google Search Console and external-account follow-up

- Run Google's Rich Results Test on the deployed Hriday page and oil page. In the existing .in Search Console property, choose Product snippets → the missing-offer issue → Validate fix after the updated HTML is live. No fake reviews/ratings are required to solve the missing-offer requirement.
- Confirm https://www.madhavmarketingayurveda.in/sitemap.xml loads, then submit/check that same sitemap in Search Console. No additional sitemap per ingredient batch or past edit is needed.
- Inspect representative new canonical product and ingredient URLs and request indexing after deployment. Use Change of Address on the old property only after redirects are active and ownership of both properties is verified.
- The screenshot's Page with redirect exclusions are expected for intentionally redirected aliases. Crawled — currently not indexed is a separate Google indexing decision; the seven exact URLs and recrawl state require Search Console access. Valid markup and a sitemap do not guarantee indexing or rankings.
- Vercel domain ownership, authoritative DNS records, certificates, the actual deployment result, Formspree delivery, GSC validation/indexing and physical-device behavior were not changed or independently certified through account access. Check one real enquiry yourself after deployment and verify Amazon destinations in your normal browser. Existing external URLs were preserved.

## Preservation and upload notes

Product data, ingredient data, prices, contact endpoint, medical statements, composition, directions, precautions, addresses, telephone numbers, Amazon links, image source files and all seven translation dictionaries were compared against the supplied repository and remain unchanged. No site dependency, framework, font, external script, rating, stock statement or payment integration was added. Temporary browser tooling and audit screenshots are excluded from the delivered repository.

For the smaller update ZIP: extract it and copy the CONTENTS of updated-files/ over the existing repository root, keeping the scripts/ and tests/ paths. For the full source ZIP: use the contents of Madhav-Marketing-main/ as the repository root. Do not upload only a ZIP or nest the entire project under a new folder. Rebuild on Vercel; do not upload local node_modules.
