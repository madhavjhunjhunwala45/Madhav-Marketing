// Public search settings. Edit titles/descriptions here, then commit to GitHub.
// Vercel rebuilds the sitemap and searchable HTML automatically.
// Keep the origin without a trailing slash; change it when moving domains.
window.madhavSearchSettings = {
  origin: 'https://www.madhavmarketingayurveda.in',
  previousHost: 'www.madhavmarketing.store',
  businessName: 'Madhav Marketing',
  home: {
    title: 'Ayurvedic Wellness Products | Madhav Marketing',
    description: 'Explore Madhav Marketing’s Ayurvedic wellness range, including Dard Haran, Kabj Haran and Madhumeh Haran. View ingredients, pack details and directions.'
  },
  ingredients: {
    title: 'Ayurvedic Ingredient Guide | Madhav Marketing',
    description: 'Explore the ingredients in Madhav Marketing’s Ayurvedic preparations, with source photographs, traditional properties, research references and composition guides.',
    profiles: {
      "clove": {
        "description": "Clove (Laung) in Dard Haran Capsule and Dard Haran Oil. Compare its label names, listed parts, amounts and separate oral and external uses."
      },
      "mochras": {
        "description": "Read about Mochras (Semal gum) in Arshharan Capsules. See its source plant, listed preparation, amount per capsule and full product composition."
      },
      "surana": {
        "description": "Surana in Arshharan Capsules: read the listed purified powder, amount per capsule, source-plant information and complete composition."
      },
      "bibhitaki": {
        "description": "Bibhitaki (Baheda) in Kabj Haran Granules. See its botanical identity, listed amount and composition basis, with links to the full product details."
      }
    }
  },
  cart: {
    title: 'Your Cart | Madhav Marketing',
    description: 'Review your selected Madhav Marketing products and pack sizes. Send your cart by WhatsApp or email to enquire about availability and delivery.'
  },
  // Optional per-product overrides. The key must match product-data.js.
  // Without an override, the existing product name and description are used.
  products: {
    'dard-capsule': { title: 'Dard Haran Capsule for Joint & Muscle Care | Madhav Marketing', description: 'Explore Dard Haran Capsule, a 30-capsule Ayurvedic joint and muscle care formulation. Read the ingredients, label directions and precautions.' },
    'dard-oil': {
      title: 'Dard Haran Oil | Ayurvedic Massage Oil | Madhav Marketing',
      description: 'Dard Haran Oil is an Ayurvedic oil for joint and muscle massage. Compare 50 ml and 100 ml packs, prices, ingredients and external-use directions.',
      faqHeading: 'Questions about Dard Haran Oil',
      faqs: [
        { id: 'use', question: 'What is Dard Haran Oil used for?', answerSource: 'benefits' },
        { id: 'packs', question: 'Do the 50 ml and 100 ml oils have the same ingredients?', answer: 'Yes. Both Dard Haran Oil packs have the same composition; only the pack size differs. Ingredient quantities in the table are stated per 100 ml.' },
        { id: 'directions', question: 'How should I use Dard Haran Oil?', answerSource: 'application' }
      ]
    },
    'kabi-haran': { title: 'Kabj Haran Granules for Digestive Wellbeing | Madhav Marketing', description: 'Explore Kabj Haran Granules, a 100 g Ayurvedic digestive-wellbeing formulation. Read its ingredients, pack directions and pregnancy precaution.' },
    'madhumeh-value': {
      title: 'Madhumeh Haran | Karela Jamun Churan | Madhav Marketing',
      description: 'Madhumeh Haran is a 200 g Karela Jamun Churan for traditional metabolic wellbeing. See price, composition, label directions and compare Madhumeh Haran BKR.',
      faqHeading: 'Questions about Madhumeh Haran',
      faqs: [
        { id: 'use', question: 'What is Madhumeh Haran?', answerSource: 'benefits' },
        { id: 'composition', question: 'What ingredients are listed in Madhumeh Haran?', answer: 'The 200 g pack lists Karela and Jamun at 250 mg each per gram. The complete composition table lists all 14 components and their quantities.' },
        { id: 'directions', question: 'How should I take Madhumeh Haran?', answerSource: 'directions' }
      ]
    },
    'madhumeh-premium': {
      title: 'Madhumeh Haran BKR | Karela Jamun Yog | Madhav Marketing',
      description: 'Explore Madhumeh Haran BKR, a 200 g Karela Jamun formulation listing Basant kusumakar at 10 mg per gram. See price, full composition and pack guidance.',
      faqHeading: 'Questions about Madhumeh Haran BKR',
      faqs: [
        { id: 'use', question: 'What is Madhumeh Haran BKR?', answerSource: 'benefits' },
        { id: 'composition', question: 'How much Basant kusumakar does Madhumeh Haran BKR contain?', answer: 'The composition lists Basant kusumakar at 10 mg per gram. It also lists Karela and Jamun at 250 mg each per gram. Read the complete 16-component panel for the full formula.' },
        { id: 'directions', question: 'How should I take Madhumeh Haran BKR?', answerSource: 'directions' }
      ]
    },
    'hriday-rakshak': { title: 'Hriday Rakshak Yog for Heart Wellness | Madhav Marketing', description: 'Explore Hriday Rakshak Yog, a 200 g Ayurvedic heart-wellness formulation with Arjuna, garlic and Ashwagandha. Read its composition and label guidance.' },
    'arshharan': { title: 'Arshharan Syrup for Piles Care | Madhav Marketing', description: 'Explore Arshharan Syrup in a 300 ml pack. Read the supplied Ayurvedic composition, intended-use information, label directions and precautions.' },
    'arshharan-capsules': { title: 'Arshharan Capsules for Piles Care | Madhav Marketing', description: 'Explore Arshharan Capsules in a 30-capsule pack. Read the supplied composition, label directions, precautions and related Arshharan Syrup information.' }
  },
  categories: {},
  pages: {},
  organization: {
    telephone: '+919431655050',
    email: 'madhavmarketing999@gmail.com',
    description: 'Madhav Marketing is a proprietorship Ayurvedic brand based in Muzaffarpur, Bihar.',
    // Store/supply address and PIN confirmed by the owner. Manufacturing remains in Haridwar.
    // Keep the existing Haridwar contact address separate from distribution.
    addresses: [
      {
        name: 'Jagdamba Agency',
        streetAddress: 'Motijheel',
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
      "heading": "Madhumeh Haran and Madhumeh Haran BKR",
      "intro": "Compare Madhumeh Haran and Madhumeh Haran BKR in 200 g packs. Both list Karela and Jamun, with ingredient amounts stated per gram. Madhumeh Haran BKR also lists Vasant Kusumakar Ras (Basant kusumakar on the label) at 10 mg per gram. Read each product’s full composition and directions before choosing a formulation.",
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
      "heading": "Madhumeh Haran and Madhumeh Haran BKR",
      "title": "Madhumeh Haran & BKR | Karela Jamun Range | Madhav Marketing",
      "description": "Compare Madhumeh Haran and Madhumeh Haran BKR: 200 g packs, ingredients per gram, prices and label directions. Review both Karela Jamun formulations.",
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
      "description": "Contact Madhav Marketing, a proprietorship brand based in Muzaffarpur, Bihar, for product availability and retailer enquiries. Call or use the enquiry form."
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
