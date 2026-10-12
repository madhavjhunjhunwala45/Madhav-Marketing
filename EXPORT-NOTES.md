# Export notes

Based on published Madhav Marketing version 15, source commit 8bb0fefe1f3d36eb69ee46fe2606eb06e93111ae. This is a separate project prepared for uploading to your own GitHub repository and hosting on Vercel. It does not modify or retire the current public Site.

Changes for independent hosting: added static Vercel configuration and editing/setup guides; split the same translation dictionaries into readable language files; changed the contact integration from the old /api/connect backend to an optional Formspree endpoint, with an explicitly unsent email-draft fallback. The ChatGPT-authenticated leads dashboard/database and prior contacts are not bundled. Product data, ingredient claims, quantities, images and credits remain as published.

Checks passed: all local page/product assets; all eight products and seven translated dictionaries; exact asset bytes and product/ingredient data compared with the published source; mouse/touch/trackpad event tests; simulated form validation, email-draft behaviour, provider responses, retry/failure states and explicit consent. No real enquiry was submitted. Browser/device QA, an actual Formspree submission and an actual Vercel deployment were not available in this workspace; check those after configuring your accounts.
