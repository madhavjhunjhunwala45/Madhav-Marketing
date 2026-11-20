// Public prices: INR per retail pack. Edit unitPrice to update the website.
// Screenshot prices exclude Amazon coupons. MRP is recorded only when supplied.
// Temporary checkout prepares a WhatsApp or email cart enquiry; no payments are collected.
export const storeConfig = {
  currency: 'INR',
  checkout: {status: 'enquiry', whatsappNumber: '+919431655050'},
  delivery: {status: 'pending'},
  priceSource: 'Regular listing prices in supplied Amazon screenshots, 17 October 2026; excludes coupons. Arshharan Capsules MRP and selling price confirmed by the brand as INR 225 on 17 November 2026.',
  products: [
    {sku:'dard-capsule',productId:'dard-capsule',mrp:null,unitPrice:225,amazonUrl:'https://amzn.in/d/06AFeap8'},
    {sku:'dard-oil-50',productId:'dard-oil',formatIndex:0,pack:'50 ml',mrp:null,unitPrice:120,amazonUrl:'https://amzn.in/d/0ceW3qHD'},
    {sku:'dard-oil-100',productId:'dard-oil',formatIndex:1,pack:'100 ml',mrp:null,unitPrice:220,amazonUrl:'https://amzn.in/d/0ceW3qHD'},
    {sku:'kabj-haran',productId:'kabi-haran',mrp:null,unitPrice:105,amazonUrl:'https://amzn.in/d/0eE7lHxG'},
    {sku:'madhumeh-haran',legacySkus:['madhumeh-value'],productId:'madhumeh-value',mrp:null,unitPrice:298,amazonUrl:'https://amzn.in/d/0cIi5Vdn'},
    {sku:'madhumeh-haran-bkr',legacySkus:['madhumeh-premium'],productId:'madhumeh-premium',mrp:null,unitPrice:775,amazonUrl:'https://amzn.in/d/04vIw3Ao'},
    {sku:'hriday-rakshak',productId:'hriday-rakshak',mrp:null,unitPrice:349,amazonUrl:'https://amzn.in/d/020JGI9e'},
    {sku:'arshharan',productId:'arshharan',mrp:null,unitPrice:210,amazonUrl:'https://amzn.in/d/0fvwlDOS'},
    {sku:'arshharan-capsules',productId:'arshharan-capsules',mrp:225,unitPrice:225,amazonUrl:'https://amzn.in/d/03D6UjAp'}
  ]
};
