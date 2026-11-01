# Editing the optimized website

The file map and deployment steps are in README.md. Edit the existing GitHub repository, commit the change, and wait for Vercel Ready.

Keep product IDs, image paths and English translation keys consistent. The legacy internal ID kabi-haran is retained for existing links; displayed product names are unchanged. English product information is in product-data.js. Ingredient information is in ingredient-data.js. Price edits go in store-config.mjs. Formspree configuration stays in site-settings.js. Translations are loaded only when their language is selected.

All page styles now live in styles.css, in their original cascade order. Common page behavior is in website.js; cart/contact implementation is in shop.js. Their implementation names are retained despite whitespace minification. There are no framework dependencies and no build step for publishing.

Keep IMAGE_CREDITS.md and the source/author/licence fields when editing ingredient photographs. Keep all full-size label photos: they are used by the enlarged-photo viewer.
