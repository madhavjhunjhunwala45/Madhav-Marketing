// Public search settings. Edit titles/descriptions here, then commit to GitHub.
// Vercel rebuilds the sitemap and searchable HTML automatically.
// Keep the origin without a trailing slash; change it when moving domains.
window.madhavSearchSettings = {
  origin: 'https://www.madhavmarketing.store',
  previousHost: 'madhav-marketing.vercel.app',
  businessName: 'Madhav Marketing',
  home: {
    title: 'Madhav Marketing | Ayurvedic Products from Haridwar',
    description: 'Ayurvedic products manufactured in Haridwar and supplied from Muzaffarpur, Bihar. Explore Madhav Marketing’s Dard Haran, Kabj Haran and Madhumeh Haran range.'
  },
  ingredients: {
    title: 'Ayurvedic Ingredient Guide | Madhav Marketing',
    description: 'Explore the ingredients in Madhav Marketing’s Ayurvedic preparations, with source photographs, traditional properties, research references and composition guides.'
  },
  cart: {
    title: 'Your Cart | Madhav Marketing',
    description: 'Review your selected Madhav Marketing products and pack sizes. Send your cart by WhatsApp or email to enquire about availability and delivery.'
  },
  // Optional per-product overrides. The key must match product-data.js.
  // Without an override, the existing product name and description are used.
  products: {},
  organization: {
    telephone: '+919431655050',
    email: 'madhavmarketing999@gmail.com',
    description: 'Our products are manufactured in Haridwar, Uttarakhand. Our main supply and distribution operations are based in Muzaffarpur, Bihar.',
    // Store/supply address and PIN confirmed by the owner. Manufacturing remains in Haridwar.
    // Keep the existing Haridwar contact address separate from distribution.
    addresses: [
      {
        name: 'Store and supply address',
        streetAddress: 'Jagdamba Agency, Motijheel',
        addressLocality: 'Muzaffarpur',
        addressRegion: 'Bihar',
        postalCode: '842001',
        addressCountry: 'IN'
      },
      {
        name: 'Haridwar address',
        streetAddress: 'Bhalla Road, Opp. Main Post Office',
        addressLocality: 'Haridwar',
        addressRegion: 'Uttarakhand',
        addressCountry: 'IN'
      }
    ],
    logo: 'assets/madhav-logo-transparent.png',
    sameAs: [
      'https://www.instagram.com/madhavmarketing.ayur/',
      'https://www.amazon.in/storefront?me=A3L31398OMPC2C'
    ]
  }
};
