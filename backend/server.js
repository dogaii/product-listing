const express = require('express');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 5001;

// Enable CORS
app.use(cors());

// Load products from JSON file
let products;
try {
  products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
} catch (error) {
  console.error('Error loading products.json:', error.message);
  process.exit(1); // Exit server if products can't be loaded
}

// Fetch gold price dynamically
async function getGoldPrice() {
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/goldprice', {
        headers: {
            'X-Api-Key': 'Fx8SXvw+gfXQ5vvCU2d+7w==pSBifLoCYJRV9OGi', // API 
          'Content-Type': 'application/json',
        },
      });
      const pricePerOunce = response.data.price;
      return (pricePerOunce / 31.1035).toFixed(2); // Gram başına fiyat
    } catch (error) {
      console.error('Error fetching gold price:', error.response?.data || error.message);
      return 60; // Hata durumunda varsayılan fiyat
    }
  }
  

// Products endpoint with filtering
app.get('/products', async (req, res) => {
  const { minPrice, maxPrice, minPopularity, maxPopularity } = req.query;

  // Fetch gold price dynamically
  const goldPrice = await getGoldPrice();

  // Map products to calculate price and normalize popularity
// Map products to calculate price and normalize popularity
let filteredProducts = products.map((product) => ({
    ...product,
    price: ((product.popularityScore + 1) * product.weight * goldPrice / 1000).toFixed(2),
    popularityScoreOutOf5: Math.min(Number((product.popularityScore / 20).toFixed(1)), 5),
  }));
  
  // Apply filters
  if (minPrice) {
    filteredProducts = filteredProducts.filter((product) => product.price >= minPrice);
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter((product) => product.price <= maxPrice);
  }
  if (minPopularity) {
    filteredProducts = filteredProducts.filter(
      (product) => product.popularityScoreOutOf5 >= minPopularity
    );
  }
  if (maxPopularity) {
    filteredProducts = filteredProducts.filter(
      (product) => product.popularityScoreOutOf5 <= maxPopularity
    );
  }
  
  filteredProducts = filteredProducts.filter(
    (value, index, self) => index === self.findIndex((t) => t.name === value.name)
  );
  
  res.json(filteredProducts);
  
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
