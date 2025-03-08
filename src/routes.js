const express = require("express");
const axios = require("axios");

const router = express.Router();

// Get videos from YouTube API
router.get("/videos", async (req, res) => {
  try {
    const API_KEY = process.env.RAPIDAPI_KEY;  // Make sure this is set!
    const response = await axios.get("https://youtube-v31.p.rapidapi.com/search", {
      params: {
        part: "snippet",
        maxResults: 10,
        q: "trending",
      },
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "youtube-v31.p.rapidapi.com",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching videos:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

module.exports = router;
