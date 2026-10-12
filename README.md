# Madhav Marketing — GitHub + Vercel

This is the ready-to-upload, independently hosted website project. Its pages, eight languages, transparent product photos, ingredient guide, Amazon links, Instagram link and touch/mouse/trackpad gestures are included. No build tools, Node dependencies, database or ChatGPT hosting are required for the catalogue.

## 1. Upload to GitHub

1. Extract `Madhav-Marketing-GitHub-Vercel.zip`.
2. Create a repository on https://github.com/new, for example `madhav-marketing`.
3. Open the repository and choose **Add file → Upload files** (or the upload link on an empty repository).
4. Open the extracted folder. Upload the top-level files and the `translations/` and `tests/` folders first; commit them. Then choose **Add file → Upload files** again and drag the complete `assets/` folder into GitHub, keeping its subfolders intact. This stays below GitHub’s 100-file-per-upload limit. Upload the files themselves, not the ZIP.
5. Commit to `main`. At the repository's top level you should see `index.html`, `vercel.json`, `product-data.js`, `site-settings.js`, `assets/` and `translations/`. These files should not be nested inside an additional parent folder.

If GitHub asks for smaller uploads, add the main files and translations first, then drag the assets folder in a second upload. Each file in this project is below GitHub's 25 MiB browser-upload limit. You may also use GitHub Desktop.

## 2. Connect Vercel

1. Visit https://vercel.com/new and connect your GitHub account.
2. Import the repository you just created.
3. Framework Preset: **Other**.
4. Root Directory: repository root; leave it at the default.
5. Build Command: override and leave **empty**.
6. Output Directory: **`.`** (a single dot).
7. Install Command: leave empty. There is no `package.json` and no dependencies to install.
8. Click **Deploy**. `vercel.json` already supplies the equivalent settings.
9. Use Vercel's project settings to attach your own domain if desired. Keep `main` as the Production Branch.

After you connect the repository, commits to `main` trigger new production deployments. New branches provide preview deployments; merge them into `main` when ready to update the live site. You do not have to re-upload the whole website for each edit.

## 3. Make changes on the live website

Open the file in GitHub, choose the pencil/Edit button, make your change and commit it to `main`. Vercel then publishes that revision automatically. Check the deployment status in Vercel and open the new live version after it succeeds.

See `EDITING-GUIDE.md` for the exact file to change. Product information is centralized in `product-data.js`; the homepage, product pages and range carousel read from it. Each language has its own readable file in `translations/` so translations can be edited directly in GitHub. Cache settings request revalidation so edits do not require changing date/version query strings.

## 4. Enable stored enquiry submissions

The enquiry form has two modes:

- **Default, no account setup:** it opens the visitor's email app with a prepared enquiry addressed to `madhavmarketing999@gmail.com`. The visitor must press Send in that app. The website clearly says this is an email draft; it does not claim the enquiry is saved.
- **Formspree configured:** it submits the validated name, email/phone, city, interest, language and explicit marketing-consent fields to your Formspree form. A saved message appears only after a successful response.

To enable the second mode:

1. Create your own form at https://formspree.io/ and verify its destination email.
2. Copy your form endpoint, in the format `https://formspree.io/f/yourformid`.
3. In GitHub, edit `site-settings.js` and put that endpoint between the quotes in `contactFormEndpoint`.
4. Commit the change to `main`, wait for Vercel to deploy and make a test enquiry using your own details.
5. Verify the submission in your Formspree account. Use its authenticated dashboard for enquiries and its export tools where available on your plan. Use only explicit `marketing_consent: Yes` submissions for marketing and honour opt-out requests.

No Formspree account or endpoint is preconfigured. Provider limits, spam protection, CAPTCHA and exports depend on your form's current settings/plan. This project's integration is AJAX-based; a custom challenge may require adding the provider's matching frontend widget. Test with your actual account after configuring it.

The old ChatGPT-only `/admin/leads` dashboard and its stored enquiries are not transferred to this project. Export any previous enquiries from the old website separately. The old website stays published until you choose to retire it.

## What's included

- `index.html`, `product.html`, `ingredients.html`: pages.
- `product-data.js`: all eight products, formats, pack details, formula quantities, benefits, image paths and Amazon links.
- `ingredient-data.js`: ingredient profiles and component benefits.
- `translations/`: Hindi, Marathi, Telugu, Tamil, Bengali, Punjabi and Gujarati; English comes from the page/data text.
- `assets/cutouts/`: all current transparent product display and full-size images, including the masked Arsh syrup composition panel.
- `assets/ingredients/`: representative illustrations/fallbacks. Credited ingredient photographs load from Wikimedia, as on the existing site.
- `IMAGE_CREDITS.md`, `BENEFITS_NOTES.md`, `INGREDIENT_REVIEW.md`: credits and source notes.
- `site-settings.js`: enquiry form endpoint and email-draft recipient.
- `vercel.json`: Vercel deployment settings.
- `tests/`: local checks; no installation is necessary to publish.

## Preview locally

From this folder, run `python3 -m http.server 8080`, then open http://localhost:8080. Opening HTML directly with `file://` is not a reliable test for the module-based enquiry form.

## Official references

- Uploading files: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Static Vercel setup: https://vercel.com/docs/builds/configure-a-build
- Git-linked deployments: https://vercel.com/docs/git
- Vercel configuration: https://vercel.com/docs/project-configuration/vercel-json
- Formspree setup: https://formspree.io/html/
- AJAX forms: https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax/
