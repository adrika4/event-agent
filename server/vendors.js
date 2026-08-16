const VENDORS = [
  { name: "Delhi Spice Caterers", category: "catering", area: "Dwarka", estimatedCost: 700, rating: 4.5 },
  { name: "Royal Feast Catering", category: "catering", area: "Saket", estimatedCost: 900, rating: 4.7 },
  { name: "Budget Bites Catering", category: "catering", area: "Rohini", estimatedCost: 450, rating: 4.1 },
  { name: "Momento Photography", category: "photography", area: "Dwarka", estimatedCost: 25000, rating: 4.6 },
  { name: "FrameCraft Studios", category: "photography", area: "Vasant Kunj", estimatedCost: 40000, rating: 4.8 },
  { name: "Candid Clicks", category: "photography", area: "Saket", estimatedCost: 18000, rating: 4.2 },
  { name: "Bloom & Petal Decor", category: "decoration", area: "Dwarka", estimatedCost: 30000, rating: 4.4 },
  { name: "Grand Occasion Decorators", category: "decoration", area: "Chattarpur", estimatedCost: 60000, rating: 4.7 },
  { name: "Simple Elegance Decor", category: "decoration", area: "Rohini", estimatedCost: 15000, rating: 4.0 },
  { name: "DJ Rhythm Nation", category: "dj", area: "Dwarka", estimatedCost: 20000, rating: 4.5 },
  { name: "Beats & Bass Entertainment", category: "dj", area: "Punjabi Bagh", estimatedCost: 35000, rating: 4.6 },
  { name: "City Cab Transport", category: "transport", area: "Dwarka", estimatedCost: 12000, rating: 4.3 },
  { name: "Premium Wedding Cars", category: "transport", area: "Saket", estimatedCost: 25000, rating: 4.7 },
  {
    name: "Omnia by Tivoli Dwarka",
    category: "venue",
    area: "Dwarka",
    estimatedCost: 220000,
    capacity: 550,
    costPerHead: 1600,
    rating: 4.5,
    reviewCount: 395,
    vibe: "Grand premium entrance with strong catering, popular for weddings and corporate events.",
  },
  {
    name: "ELATE By DROOL",
    category: "venue",
    area: "Dwarka",
    estimatedCost: 180000,
    capacity: 250,
    costPerHead: 1500,
    rating: 4.5,
    reviewCount: 674,
    vibe: "Fits 100–250 guests, known for good food and hands-on coordinators.",
  },
  {
    name: "Ambria Exotica",
    category: "venue",
    area: "Dwarka",
    estimatedCost: 275000,
    capacity: 500,
    costPerHead: 1800,
    rating: 4.6,
    reviewCount: 278,
    vibe: "High-end wedding venue with strong decor and attentive staff.",
  },
  {
    name: "Ambria Pushpanjali",
    category: "venue",
    area: "Dwarka",
    estimatedCost: 240000,
    capacity: 600,
    costPerHead: 1700,
    rating: 4.4,
    reviewCount: 2038,
    vibe: "Large and photogenic with strong food, though guests report it is tricky to locate.",
  },
  {
    name: "Regalia Eden",
    category: "venue",
    area: "Dwarka",
    estimatedCost: 140000,
    capacity: 160,
    costPerHead: 1400,
    rating: 4.2,
    reviewCount: 1712,
    vibe: "Comfortable for 100–150 guests, with well-reviewed food and mixed cleanliness feedback.",
  },
  {
    name: "Devam Palace Banquet",
    category: "venue",
    area: "Dwarka",
    estimatedCost: 170000,
    capacity: 300,
    costPerHead: 1450,
    rating: 4.3,
    reviewCount: 143,
    vibe: "Decor and staff are praised, while food quality reviews are inconsistent.",
  },
  {
    name: "Shree Manglam Banquet & Lawn",
    category: "venue",
    area: "Rohini",
    estimatedCost: 160000,
    capacity: 220,
    costPerHead: 1300,
    rating: 4.9,
    reviewCount: 39,
    vibe: "Small review sample but consistently praised for family functions.",
  },
];

function suggestVendors({ category, area, maxCost }) {
  const matches = VENDORS.filter((v) => {
    const categoryOk = !category || v.category.toLowerCase() === category.toLowerCase();
    const areaOk = !area || v.area.toLowerCase().includes(area.toLowerCase());
    const costOk = !maxCost || v.estimatedCost <= maxCost;
    return categoryOk && areaOk && costOk;
  });

  return {
    query: { category: category || "any", area: area || "any", maxCost: maxCost || "any" },
    matchCount: matches.length,
    vendors: matches.length > 0 ? matches : VENDORS.filter((v) => !category || v.category === category).slice(0, 3),
  };
}

module.exports = { suggestVendors };