import axios from "axios";
import NodeCache from "node-cache";
import dotenv from "dotenv";

dotenv.config();

const MANGADX_API_URL = process.env.MANGADX_API_URL || "https://api.mangadex.org";

export default async function handler(req, res) {
  // Set CORS headers to allow cross-origin requests (if needed)
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080"); // You can specify your frontend URL here instead of "*"
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request (preflight request) for CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { query } = req.query;

  // Return error if the query parameter is missing
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // Make request to MangaDex API to search for manga by title
    const searchResponse = await axios.get(`${MANGADX_API_URL}/manga`, {
      params: { title: query },
    });

    // If no manga found, return a 404 error
    if (!searchResponse.data?.data?.length) {
      return res.status(404).json({ error: "No manga found for the given query" });
    }

    const mangaIds = searchResponse.data.data.map((manga) => manga.id);

    // Fetch detailed information for each manga found
    const mangaDetailsPromises = mangaIds.map(async (id) => {
      try {
        const response = await axios.get(`${MANGADX_API_URL}/manga/${id}`);
        const attributes = response.data.data?.attributes;
        const relationships = response.data.data?.relationships || [];

        // Default cover URL if no cover is found
        let coverUrl = "default-cover.jpg";

        // Look for a cover art relationship and fetch the cover image URL
        const coverArtRelationship = relationships.find((rel) => rel.type === "cover_art");
        if (coverArtRelationship) {
          const coverResponse = await axios.get(`${MANGADX_API_URL}/cover/${coverArtRelationship.id}`);
          const filename = coverResponse.data?.data?.attributes?.fileName;
          if (filename) {
            coverUrl = `https://uploads.mangadex.org/covers/${id}/${filename}`;
          }
        }

        // Return the manga details, including cover image and genres
        return {
          id,
          title: attributes?.title || "Unknown Title",
          description: attributes?.description || "No description available.",
          cover: coverUrl,
          status: attributes?.status || "Unknown",
          year: attributes?.year || "Unknown",
          genres: attributes?.tags?.filter((tag) => tag.attributes.group === "genre")
            .map((tag) => tag.attributes.name?.en) || [],
        };
      } catch (error) {
        console.error(`Error fetching details for manga ID ${id}:`, error.message);
        return null;
      }
    });

    // Wait for all manga details to be fetched and filter out any failed ones
    const mangaDetails = (await Promise.all(mangaDetailsPromises)).filter(Boolean);

    // Cache the fetched data for future use
    setCachedData(cacheKey, mangaDetails);

    // Return the fetched manga details
    return res.json(mangaDetails);
  } catch (error) {
    // Handle unexpected errors and log them for debugging
    console.error("Error fetching manga data:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
