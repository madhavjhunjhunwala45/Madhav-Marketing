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
    'dard-capsule': {
      "title": "Dard Haran Capsule | Joint & Muscle Care | Madhav Marketing",
      "description": "Dard Haran Capsule is the oral formulation in our joint and muscle care range. See the 30-capsule pack, price, composition and printed directions.",
      "faqHeading": "Questions about Dard Haran Capsule",
      "faqs": [
        {
          "id": "use",
          "question": "What is Dard Haran Capsule used for?",
          "answerSource": "benefits"
        },
        {
          "id": "composition",
          "question": "What ingredients are listed in Dard Haran Capsule?",
          "answer": "The 30-capsule pack lists 13 components, including Nirgundi, Haridra, Sonth and Pippali. Amounts in the composition table are stated per capsule."
        },
        {
          "id": "directions",
          "question": "How should I take Dard Haran Capsule?",
          "answerSource": "directions"
        }
      ]
    },
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
    'kabi-haran': {
      "title": "Kabj Haran Granules | Digestive Care | Madhav Marketing",
      "description": "Explore Kabj Haran Granules in a 100 g pack for traditional digestive wellbeing. See price, composition, label directions and the pregnancy precaution.",
      "faqHeading": "Questions about Kabj Haran Granules",
      "faqs": [
        {
          "id": "use",
          "question": "What are Kabj Haran Granules used for?",
          "answerSource": "benefits"
        },
        {
          "id": "composition",
          "question": "What ingredients are listed in Kabj Haran Granules?",
          "answer": "The 100 g pack lists Senna, Haritaki, Amla, Saunf and other components. Read the complete table for the listed percentages and quantities."
        },
        {
          "id": "precautions",
          "question": "What precaution is listed for Kabj Haran Granules?",
          "answerSource": "precautions"
        }
      ]
    },
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
    'hriday-rakshak': {
      "title": "Hriday Rakshak Yog | 200 g Ayurvedic Formula | Madhav Marketing",
      "description": "Explore Hriday Rakshak Yog, a 200 g heart-wellness formulation with Arjuna bark, garlic and Ashwagandha. See price, composition and label guidance.",
      "faqHeading": "Questions about Hriday Rakshak Yog",
      "faqs": [
        {
          "id": "use",
          "question": "What is Hriday Rakshak Yog used for?",
          "answerSource": "benefits"
        },
        {
          "id": "composition",
          "question": "What ingredients are listed in Hriday Rakshak Yog?",
          "answer": "The 200 g pack lists 12 components, including Arjuna bark, garlic and Ashwagandha. The composition table states the amounts per gram."
        },
        {
          "id": "directions",
          "question": "How should I take Hriday Rakshak Yog?",
          "answerSource": "directions"
        }
      ]
    },
    'arshharan': {
      "title": "Arshharan Syrup | 300 ml Pack | Madhav Marketing",
      "description": "Explore Arshharan Syrup for traditional piles care in a 300 ml pack. See price, full composition, printed directions and the capsule-format comparison.",
      "faqHeading": "Questions about Arshharan Syrup",
      "faqs": [
        {
          "id": "use",
          "question": "What is Arshharan Syrup used for?",
          "answerSource": "benefits"
        },
        {
          "id": "composition",
          "question": "How do I read the Arshharan Syrup quantities?",
          "answer": "The 300 ml syrup has its own composition panel. Its quantities are stated as extracts derived from the listed ingredients per 10 ml. Read the complete panel rather than comparing these amounts with the capsule formula."
        },
        {
          "id": "directions",
          "question": "How should I take Arshharan Syrup?",
          "answerSource": "directions"
        }
      ]
    },
    'arshharan-capsules': {
      "title": "Arshharan Capsules | 30-Capsule Pack | Madhav Marketing",
      "description": "Explore Arshharan Capsules for traditional piles care. View the 30-capsule pack, price, composition, label guidance and comparison with Arshharan Syrup.",
      "faqHeading": "Questions about Arshharan Capsules",
      "faqs": [
        {
          "id": "use",
          "question": "What are Arshharan Capsules used for?",
          "answerSource": "benefits"
        },
        {
          "id": "composition",
          "question": "How do I read the Arshharan Capsules quantities?",
          "answer": "The 30-capsule pack has a separate composition panel, with listed amounts per 500 mg capsule. It is a different formulation from Arshharan Syrup; read each product’s own directions."
        },
        {
          "id": "directions",
          "question": "How should I take Arshharan Capsules?",
          "answerSource": "directions"
        }
      ]
    }
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
      "heading": "Kabj Haran Granules for digestive wellbeing",
      "intro": "Explore Kabj Haran Granules in a 100 g pack. Read the full ingredient panel, label directions and pregnancy precaution, with links to the product and ingredient guides.",
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
      "heading": "Hriday Rakshak Yog for heart wellness",
      "intro": "Explore Hriday Rakshak Yog in a 200 g pack. Its per-gram composition lists Arjuna bark, garlic, Ashwagandha and other components. Read the full panel and label directions alongside your physician-guided care plan.",
      "ingredients": [
        "arjuna",
        "garlic",
        "ashwagandha"
      ]
    },
    "piles": {
      "path": "piles-fissure-care.html",
      "label": "Piles and fissure care",
      "heading": "Arshharan Syrup and Arshharan Capsules",
      "intro": "Compare Arshharan Syrup in a 300 ml pack and Arshharan Capsules in a 30-capsule pack. Their ingredient panels and directions differ. Read each complete composition and the current pack before choosing a product.",
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
      "heading": "Kabj Haran Granules for digestive wellbeing",
      "title": "Kabj Haran Granules | Digestive Wellness Range | Madhav Marketing",
      "description": "Read the Kabj Haran Granules guide: 100 g pack, listed ingredients and percentages, price, directions and pregnancy precaution.",
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
      "heading": "Hriday Rakshak Yog for heart wellness",
      "title": "Hriday Rakshak Yog for Heart Wellness | Madhav Marketing",
      "description": "Read the Hriday Rakshak Yog guide: 200 g pack, per-gram composition, price and label directions. Explore its listed Arjuna bark, garlic and Ashwagandha.",
      "group": "heart",
      "products": []
    },
    "piles-fissure-care.html": {
      "kind": "category",
      "heading": "Arshharan Syrup and Arshharan Capsules",
      "title": "Arshharan Syrup & Capsules | Piles Care | Madhav Marketing",
      "description": "Compare Arshharan Syrup and Capsules: 300 ml and 30-capsule packs, prices, separate compositions, label directions and ingredient guides.",
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
