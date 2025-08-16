import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
// Load environment variables into process.env
dotenv.config();

const app = express();
const PORT = 3000;
// Enable CORS so that external clients can access this API
app.use(cors());
// Enable JSON parsing for incoming requests
app.use(express.json());
// Read the API key
const API_KEY = process.env.SCRAPER_API_KEY;
// Define the GET route /api/scrape for scraping Amazon search results
app.get("/api/scrape", async (req, res) => {
  // Extract the keyword query parameter from the request URL
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    // Build the Amazon search URL using the provided keyword
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
    // Build the ScraperAPI request URL
    const url = `http://api.scraperapi.com?api_key=${API_KEY}&autoparse=true&url=${encodeURIComponent(searchUrl)}`;
    // Make the request to ScraperAPI and wait for the response
    const { data } = await axios.get(url);
    // If the results field is missing or not an array, return an error
    if (!data.results || !Array.isArray(data.results)) {
      return res.status(500).json({
        error: "Results not found!",
        raw: data,
      });
    }
    // Transform the list of results into a standardized product format
    const products = data.results
      .map((item) => ({
        title: item.title || item.name || null,
        rating: item.rating || item.stars || null,
        reviews:
          item.total_reviews ||
          item.reviews ||
          item.reviews_count ||
          item.number_of_reviews ||
          null,
        image: item.image || item.thumbnail || null,
        price: item.price || null,
      }))
      // Keep only products that have title, image, rating and number of reviews
      .filter((p) => p.title && p.image && p.rating && p.reviews);

    res.json({ products });
  } catch (error) {
    // Log the error
    console.error("Failed to search products:", error.message);
    res.status(500).json({ error: "Error fetching Amazon data" });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
