# Madhav Marketing website

This is a complete static website. index.html is at the ZIP root. There is no build or dependency-installation step. Extract the ZIP and use its contents as the site root, or replace the contents of the existing GitHub repository and let Vercel deploy the commit. Do not upload only the ZIP file into the repository: GitHub does not extract it.

The existing Vercel configuration and security headers are retained. The contact endpoint, support email, telephone numbers, external links, prices, product/ingredient information and all seven translation dictionaries are retained from the supplied archive. Checkout remains the existing Coming soon placeholder.

## Files to edit

| Change | File |
| --- | --- |
| Page headings, contact details and sections | index.html, product.html, ingredients.html, cart.html |
| Product information, composition and Amazon URLs | product-data.js |
| Ingredient information and source credits | ingredient-data.js |
| Prices and available retail packs | store-config.mjs |
| Formspree endpoint and support email | site-settings.js |
| Translations | translations/hi.js, mr.js, te.js, ta.js, bn.js, pa.js, gu.js |
| All styles and responsive rules | styles.css |
| Navigation, carousel, gestures, translation loader and subtle motion | website.js |
| Cart and contact-form implementation | shop.js |
| Product-page rendering | product-page.js |
| Ingredient guide rendering | ingredients.js |
| Ingredient pictures, credits and enlarged viewer | ingredient-shared.js |
| Logo and product pictures | assets/madhav-logo-transparent.png and assets/cutouts/ |

JavaScript and CSS implementation files are safely compacted; names are retained to make searching easier. Product data, ingredient data, settings, prices and translations remain readable and unchanged. No build tool is needed to edit or host the delivered files. When changing a cached script or stylesheet, change its ?v= value in all four HTML pages.

## Checks

With Node.js installed, run:

    node tests/project.test.cjs
    node tests/connect.test.cjs
    node tests/interaction.test.cjs

These checks do not send real enquiries, place orders or make payments. After deployment, send one real enquiry yourself and check its arrival in your Formspree account. Verify the Amazon destinations and test once on your own iPhone/Android browser.

IMAGE_CREDITS.md, INGREDIENT_REVIEW.md, BENEFITS_NOTES.md and PRODUCT_CUTOUTS.json are retained provenance/reference records. Historical source filenames in those records are not runtime file dependencies.
