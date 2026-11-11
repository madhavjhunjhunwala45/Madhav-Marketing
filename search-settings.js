// Public search settings. Edit titles/descriptions here, then commit to GitHub.
// Vercel rebuilds the sitemap and searchable HTML automatically.
// Keep the origin without a trailing slash; change it when moving domains.
window.madhavSearchSettings = {
  origin: 'https://www.madhavmarketing.store',
  previousHost: 'madhav-marketing.vercel.app',
  businessName: 'Madhav Marketing',
  home: {
    title: 'Ayurvedic Wellness Products from Haridwar | Madhav Marketing',
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
  products: {
    'dard-capsule': { title: 'Dard Haran Capsule for Joint & Muscle Care | Madhav Marketing', description: 'Explore Dard Haran Capsule, a 30-capsule Ayurvedic joint and muscle care formulation. Read the ingredients, label directions and precautions.' },
    'dard-oil': { title: 'Dard Haran Oil for Joint & Muscle Massage | Madhav Marketing', description: 'Explore Dard Haran Oil in 50 ml and 100 ml packs with the same formulation. Read the shared composition, external-use directions and label precautions.' },
    'kabi-haran': { title: 'Kabj Haran Granules for Digestive Wellbeing | Madhav Marketing', description: 'Explore Kabj Haran Granules, a 100 g Ayurvedic digestive-wellbeing formulation. Read its ingredients, pack directions and pregnancy precaution.' },
    'madhumeh-value': { title: 'Madhumeh Haran Value Karela Jamun Churan | Madhav Marketing', description: 'Explore the 200 g Madhumeh Haran Value Karela Jamun Churan, its ingredients and label guidance. Compare its composition with the Premium formula.' },
    'madhumeh-premium': { title: 'Madhumeh Haran Premium with Vasant Kusumakar | Madhav Marketing', description: 'Explore the 200 g Madhumeh Haran Premium formulation with Karela, Jamun and Vasant Kusumakar Ras. Compare supplied composition panels and directions.' },
    'hriday-rakshak': { title: 'Hriday Rakshak Yog for Heart Wellness | Madhav Marketing', description: 'Explore Hriday Rakshak Yog, a 200 g Ayurvedic heart-wellness formulation with Arjuna, garlic and Ashwagandha. Read its composition and label guidance.' },
    'arshharan': { title: 'Arshharan Syrup for Piles Care | Madhav Marketing', description: 'Explore Arshharan Syrup in a 300 ml pack. Read the supplied Ayurvedic composition, intended-use information, label directions and precautions.' },
    'arshharan-capsules': { title: 'Arshharan Capsules for Piles Care | Madhav Marketing', description: 'Explore Arshharan Capsules in a 30-capsule pack. Read the supplied composition, label directions, precautions and related Arshharan Syrup information.' }
  },
  categories: {},
  pages: {},
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

// SEO landing-page metadata; content is built from the unchanged catalogue.
Object.assign(window.madhavSearchSettings, {
  "categories": {
    "pain": {
      "path": "joint-muscle-care.html",
      "label": "Joint and muscle care",
      "heading": "Ayurvedic joint and muscle care products",
      "intro": "Explore Dard Haran Capsule and Dard Haran Oil: an oral formulation and an external massage oil. Compare their ingredients, pack sizes, label directions and precautions.",
      "ingredients": [
        "nirgundi",
        "boswellia",
        "turmeric",
        "wintergreen"
      ]
    },
    "digestion": {
      "path": "digestive-wellness.html",
      "label": "Digestive wellness",
      "heading": "Ayurvedic digestive wellness products",
      "intro": "Explore Kabj Haran Granules, the 100 g granule formulation in our digestive range. Read its composition, intended-use information and current label directions before choosing a product.",
      "ingredients": [
        "haritaki",
        "fennel",
        "ajwain",
        "senna"
      ]
    },
    "metabolic": {
      "path": "karela-jamun-metabolic-wellness.html",
      "label": "Karela and Jamun formulations",
      "heading": "Karela and Jamun metabolic wellness formulations",
      "intro": "Compare Madhumeh Haran Value and Premium. Both list Karela and Jamun; Premium also lists Vasant Kusumakar Ras. Review the complete panels rather than comparing ingredient names alone.",
      "ingredients": [
        "karela",
        "jamun",
        "fenugreek",
        "vasant-kusumakar"
      ]
    },
    "heart": {
      "path": "heart-wellness.html",
      "label": "Heart wellness",
      "heading": "Ayurvedic heart wellness formulations",
      "intro": "Explore Hriday Rakshak Yog, a 200 g formulation with Arjuna, garlic and Ashwagandha. Read the complete composition and label guidance alongside your physician-guided care plan.",
      "ingredients": [
        "arjuna",
        "garlic",
        "ashwagandha"
      ]
    },
    "piles": {
      "path": "piles-fissure-care.html",
      "label": "Piles and fissure care",
      "heading": "Ayurvedic piles and fissure care range",
      "intro": "Explore the Arshharan range in syrup and capsule formats. Their composition panels differ; review the ingredients, directions and precautions on each product page and the current pack.",
      "ingredients": [
        "kutaja",
        "daruhaldi",
        "nagkesar",
        "triphala"
      ]
    }
  },
  "pages": {
    "joint-muscle-care.html": {
      "kind": "category",
      "heading": "Ayurvedic joint and muscle care products",
      "title": "Ayurvedic joint and muscle care products | Madhav Marketing",
      "description": "Explore Dard Haran Capsule and Dard Haran Oil: an oral formulation and an external massage oil. Compare their ingredients, pack sizes, label directions and precautions.",
      "group": "pain",
      "products": []
    },
    "digestive-wellness.html": {
      "kind": "category",
      "heading": "Ayurvedic digestive wellness products",
      "title": "Ayurvedic digestive wellness products | Madhav Marketing",
      "description": "Explore Kabj Haran Granules, the 100 g granule formulation in our digestive range. Read its composition, intended-use information and current label directions before choosing a product.",
      "group": "digestion",
      "products": []
    },
    "karela-jamun-metabolic-wellness.html": {
      "kind": "category",
      "heading": "Karela and Jamun metabolic wellness formulations",
      "title": "Karela and Jamun metabolic wellness formulations | Madhav Marketing",
      "description": "Compare Madhumeh Haran Value and Premium. Both list Karela and Jamun; Premium also lists Vasant Kusumakar Ras. Review the complete panels rather than comparing ingredient names alone.",
      "group": "metabolic",
      "products": []
    },
    "heart-wellness.html": {
      "kind": "category",
      "heading": "Ayurvedic heart wellness formulations",
      "title": "Ayurvedic heart wellness formulations | Madhav Marketing",
      "description": "Explore Hriday Rakshak Yog, a 200 g formulation with Arjuna, garlic and Ashwagandha. Read the complete composition and label guidance alongside your physician-guided care plan.",
      "group": "heart",
      "products": []
    },
    "piles-fissure-care.html": {
      "kind": "category",
      "heading": "Ayurvedic piles and fissure care range",
      "title": "Ayurvedic piles and fissure care range | Madhav Marketing",
      "description": "Explore the Arshharan range in syrup and capsule formats. Their composition panels differ; review the ingredients, directions and precautions on each product page and the current pack.",
      "group": "piles",
      "products": []
    },
    "contact.html": {
      "kind": "contact",
      "heading": "Contact Madhav Marketing",
      "title": "Contact Madhav Marketing | Madhav Marketing",
      "description": "Haridwar and Muzaffarpur contact details, product availability and retailer enquiries for Madhav Marketing. Call or use the existing enquiry form."
    },
    "ayurveda-guides.html": {
      "kind": "guides",
      "heading": "Ayurvedic product guides",
      "title": "Ayurvedic product guides | Madhav Marketing",
      "description": "Learn how to read an Ayurvedic composition panel, compare product formats and explore the ingredient profiles in Madhav Marketing formulations."
    },
    "reading-ayurvedic-composition.html": {
      "kind": "article",
      "heading": "How to read an Ayurvedic product composition",
      "title": "How to read an Ayurvedic product composition | Madhav Marketing",
      "description": "Understand ingredient names, preparation identities, quantity bases and pack-panel differences using the supplied Madhav Marketing composition information."
    },
    "ayurvedic-product-formats.html": {
      "kind": "article",
      "heading": "Capsules, granules, churan, syrup and oil",
      "title": "Capsules, granules, churan, syrup and oil | Madhav Marketing",
      "description": "Compare the formats and pack sizes in the Madhav Marketing range. Find each product’s ingredients, label directions and precautions before making an enquiry."
    }
  }
});
