# Editing the website through GitHub

Make an edit, commit to `main`, and let Vercel deploy it. For larger changes, use a branch and review its Vercel preview before merging to `main`.

| Change | Edit this file | Where to look |
| --- | --- | --- |
| Homepage headings and sections | `index.html` | Find the exact English text |
| Product names, descriptions, benefits and composition | `product-data.js` | Find the product ID: `dard-oil`, `dard-capsule`, `kabi-haran`, `madhumeh-value`, `madhumeh-premium`, `hriday-rakshak`, `arshharan`, `arshharan-capsules` |
| Amazon product link | `product-data.js` | The product's `amazonUrl` |
| Product photos | `assets/cutouts/` and `product-data.js` | Replace a file or update `image`, gallery `src` and full-size `original` paths |
| Ingredient descriptions and component benefits | `ingredient-data.js` | `ingredientGuide`, `componentBenefits` and `componentEvidence` |
| Hindi text | `translations/hi.js` | English text is the key; Hindi text is the value |
| Marathi text | `translations/mr.js` | Same key/value structure |
| Telugu / Tamil text | `translations/te.js` / `translations/ta.js` | Same key/value structure |
| Bengali / Punjabi / Gujarati text | `translations/bn.js` / `translations/pa.js` / `translations/gu.js` | Same key/value structure |
| Colours and layout | `styles.css` | Brand colour variables are at the start in `:root` |
| Logo | `assets/madhav-logo.jpg` | Replace the image with the same filename, or change the page image paths |
| Instagram, support email and phone links | `index.html`, `product.html`, `ingredients.html` | Search for the existing account/email/phone and update text and href together |
| Email-draft recipient / stored form endpoint | `site-settings.js` | `supportEmail` and `contactFormEndpoint` |
| Product or ingredient gesture behaviour | `swipe.js`, `ingredient-swipe.js` | Thresholds, directions and interaction handling |

The actual product IDs in `product-data.js` are authoritative. Keep IDs and filenames consistent. Product data edits automatically appear wherever that product is rendered; the carousel includes every catalogue entry.

## Example: change an Amazon link

1. Open `product-data.js` in GitHub.
2. Choose Edit and find the product name.
3. Change only its `amazonUrl` string.
4. Commit to `main` and wait for Vercel's successful deployment.
5. Open the live product page and test the Amazon button.

## Example: replace a photo

Upload the new picture into `assets/cutouts/`. Keeping the existing filename avoids changing paths. If you choose a different filename, update its references in `product-data.js`; gallery thumbnails and enlarged originals use separate paths. `index.html` also contains the opening hero image as a fallback, so update that path when replacing the opening hero image.

## Editing English and translations

English strings are the lookup keys in each translation dictionary. When changing an English sentence, update that key and its translated value in all seven files. Changing only a translated value keeps the English key intact. Quantities, IDs, image paths and URLs are not translation keys. Preserve quotes and commas in JavaScript objects.

`language-data.js` initializes the dictionary. Every HTML page loads the seven `translations/*.js` files before `language.js`; keep that order if editing script tags.

## Formula and image records

Use current approved product labels when changing ingredient names, plant parts or quantities. The image edit only replaced alpha/backgrounds; source printing and the masked commercial fields were retained. Retain the Wikimedia credits and licences recorded in `IMAGE_CREDITS.md` when replacing ingredient photographs.

## Optional local checks

If Node.js is installed, run `node tests/project.test.cjs` and `node tests/connect.test.cjs` from the project folder. These check file paths/data/languages and simulated form behaviours. They do not send enquiries. Real mouse/trackpad/browser tests and your actual Formspree account still need checking after deployment.
