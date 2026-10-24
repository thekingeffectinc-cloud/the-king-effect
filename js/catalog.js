/*
 * The King Effect — product catalog (single source of truth).
 * Loaded by the browser (window.KE_CATALOG) AND by server.js (require).
 * Prices are in CENTS (USD). The server always re-prices orders from this
 * file, so a shopper can never change a price from the browser.
 */
(function (root) {
  var CATALOG = {
    currency: 'usd',
    shipping: {
      freeThreshold: 10000, // free standard shipping on orders $100+
      standard: { label: 'Standard (5–7 business days)', amount: 800, min: 5, max: 7 },
      express:  { label: 'Express (2–3 business days)', amount: 2000, min: 2, max: 3 }
    },
    products: [
      { id: 'sovereign-tee', name: 'Sovereign Tee', category: 'tees', price: 3800,
        shape: 'tee', body: '#15151f', accent: '#d4af37', bg: 'noir', badge: 'Bestseller',
        sizes: ['S','M','L','XL','XXL'], swatches: ['#15151f','#f5efe1'],
        description: 'Heavyweight 240gsm cotton, boxy fit, gold-foil crown at the chest.' },
      { id: 'crown-heavyweight-hoodie', name: 'Crown Heavyweight Hoodie', category: 'hoodies', price: 8800,
        shape: 'hoodie', body: '#5a0f22', accent: '#d4af37', bg: 'wine', badge: 'New',
        sizes: ['S','M','L','XL','XXL'], swatches: ['#5a0f22','#15151f'],
        description: '450gsm brushed fleece, double-lined hood, embroidered crown.' },
      { id: 'royal-court-long-sleeve', name: 'Royal Court Long Sleeve', category: 'tees', price: 5400,
        shape: 'longsleeve', body: '#1b2348', accent: '#d4af37', bg: 'navy',
        sizes: ['S','M','L','XL'], swatches: ['#1b2348','#15151f'],
        description: 'Midweight jersey with ribbed cuffs and sleeve script print.' },
      { id: 'gold-standard-tee', name: 'Gold Standard Tee', category: 'tees', price: 3800,
        shape: 'tee', body: '#f1e9d4', accent: '#9c7f24', bg: 'cream',
        sizes: ['S','M','L','XL','XXL'], swatches: ['#f1e9d4','#d4af37'],
        description: 'Garment-dyed bone colorway with tonal gold crest.' },
      { id: 'throne-room-hoodie', name: 'Throne Room Hoodie', category: 'hoodies', price: 9200,
        shape: 'hoodie', body: '#101018', accent: '#d4af37', bg: 'gold', badge: 'Limited',
        sizes: ['M','L','XL','XXL'], swatches: ['#101018','#d4af37'],
        description: 'Oversized fit, gold puff-print back graphic, numbered run of 300.' },
      { id: 'regent-joggers', name: 'Regent Joggers', category: 'bottoms', price: 7200,
        shape: 'joggers', body: '#1b2348', accent: '#d4af37', bg: 'navy',
        sizes: ['S','M','L','XL'], swatches: ['#1b2348','#15151f','#5a0f22'],
        description: 'Tapered fleece joggers with gold-tipped drawcords.' },
      { id: 'dynasty-snapback', name: 'Dynasty Snapback', category: 'accessories', price: 3400,
        shape: 'cap', body: '#15151f', accent: '#d4af37', bg: 'wine',
        sizes: ['One Size'], swatches: ['#15151f','#5a0f22'],
        description: 'Structured six-panel cap with 3D-embroidered crown.' },
      { id: 'heir-apparent-tee', name: 'Heir Apparent Tee', category: 'tees', price: 4000, compareAt: 4800,
        shape: 'tee', body: '#7a1630', accent: '#f1d27a', bg: 'noir', badge: 'Sale',
        sizes: ['S','M','L','XL'], swatches: ['#7a1630','#1b2348'],
        description: 'Vintage-wash burgundy tee with distressed gold lettering.' }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CATALOG;
  else root.KE_CATALOG = CATALOG;
})(typeof window !== 'undefined' ? window : this);
