# Buildable static source export

This ZIP contains the editable Vercel source, including eight products, nine retail packs, all eight interface languages, ingredient guides, cart enquiries, contact form, image viewers, build scripts and regression tests.

Use Node.js 24.x. Run `npm ci --include=dev --ignore-scripts`, `npm run build`, then `npm test`. Vercel must serve the generated `dist/` directory. Product and ingredient query routes depend on the supplied vercel.json; a plain file server is not an equivalent production deployment.

Extract the ZIP and put its source contents at the existing GitHub project root. Do not upload the ZIP itself as a website file. Keep script/test subdirectories in place and commit all related changes together. Product/ingredient data, prices, original images and contact settings are preserved. No payment integration or production deployment was performed by this export.

See README.md for current instructions and AUDIT-REPORT.md for the verification results and manual Vercel/DNS/Search Console checks. CLEANUP-REPORT.txt describes an earlier export and is retained as history.
