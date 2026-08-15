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