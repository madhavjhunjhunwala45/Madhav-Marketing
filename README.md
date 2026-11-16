# Madhav Marketing website

This repository is the editable source for the Vercel website. It requires Node.js 24.x and the build below. Vercel serves the generated `dist/` directory; uploading the source to a plain static host without building will omit the generated product/ingredient pages and sitemap.

## Install, build and test

```sh
npm ci --include=dev --ignore-scripts
npm run build
npm test
npm run preview
```

Use Node.js 24.x. If you use nvm, run `nvm install` and `nvm use` in this folder first; `.nvmrc` selects 24. The preview opens at `http://127.0.0.1:4173/` and implements this project's product/ingredient query rewrites. Stop it with Ctrl+C.

`npm run build` creates responsive images, searchable HTML, the sitemap and robots.txt, optimizes deployment output and runs the full test suite. `npm test` also works separately after a successful build. Tests simulate contact submissions; they do not send real enquiries or collect payments.

## GitHub and Vercel

1. Extract the ZIP. Copy the source files into the existing repository, preserving `scripts/`, `tests/`, `translations/` and `assets/`. GitHub does not extract an uploaded ZIP.
2. Keep `package.json`, `package-lock.json` and `vercel.json` at the project root. Include every changed build script and test in the same commit.
3. In Vercel, use Node.js 24.x, install command `npm ci --include=dev --ignore-scripts`, build command `npm run build`, output directory `dist`, and the project root containing package.json.
4. Commit to the existing production branch and check that deployment finishes successfully. Generated `dist/`, node_modules and local audit/browser tooling are not source uploads.
5. Check the homepage, one product, both oil sizes, one ingredient and the sitemap on the deployed site. Submit a real contact enquiry yourself and confirm receipt in your own account.

The preferred domain is `https://www.madhavmarketingayurveda.in`. Both `.store` hosts and the new non-www `.in` host need to belong to the same Vercel project and point to Vercel. See `AUDIT-REPORT.md` for exact checks and observed live redirect limitations.

## Files to edit

| Change | Source |
| --- | --- |
| Homepage sections and shared contact details | index.html |
| Product and ingredient templates | product.html, ingredients.html |
| Product information, composition and Amazon URLs | product-data.js |
| Ingredient information and source credits | ingredient-data.js |
| Retail pack prices in rupees (single source of truth) | store-config.mjs |
| Contact endpoint and support email | site-settings.js |
| SEO titles, descriptions and canonical origin | search-settings.js |
| Metadata and structured data | search.js |
| Generated category, contact and guide content | scripts/seo-pages.cjs |
| Server-rendered retail prices and cart placeholders | scripts/store-display.cjs |
| Build and route consistency checks | scripts/build-search.cjs, scripts/check-search.cjs, vercel.json |
| Translations | translations/hi.js, mr.js, te.js, ta.js, bn.js, pa.js, gu.js |
| Styles | styles.css, cart-checkout.css |
| Navigation, carousel, gestures and language loader | website.js |
| Cart and contact-form implementation | shop.js |
| Product-page rendering | product-page.js |
| Ingredient guide rendering and images | ingredients.js, ingredient-shared.js |
| Original logo, product and label pictures | assets/ and assets/cutouts/ |

Edit prices only in `store-config.mjs`; `unitPrice` is rupees, not paise. The existing cart converts rupees internally. The build derives displayed prices, public browser price data and Product Offers from the same configuration. Do not manually edit generated HTML prices or JSON-LD.

The cart prepares WhatsApp/email enquiries. It does not take payment or confirm availability/delivery. Preserve the existing contact endpoint, honeypot and consent behavior. Do not change medical wording, composition, directions, precautions, licences, addresses or product links without verified brand information.

Keep source files readable. Deployment minification belongs in `scripts/optimize-output.cjs`. Review all seven additional-language dictionaries whenever adding English interface text. Rebuild and run every test before publishing; do not disable tests to pass deployment.

IMAGE_CREDITS.md, INGREDIENT_REVIEW.md, BENEFITS_NOTES.md and PRODUCT_CUTOUTS.json are retained provenance/reference records. CLEANUP-REPORT.txt is a historical report, not the current deployment guide.
