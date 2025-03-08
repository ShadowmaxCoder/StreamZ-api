import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "youtube-v31.p.rapidapi.com";

export default async function handler(req, res) {
  console.log("🚀 API Request Received!");

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    console.log("⚡ OPTIONS request received, sending 200...");
    return res.status(200).end();
  }

  // Extract query and offset
  const { query, offset = 0 } = req.query;
  console.log("🔍 Query Received:", query);
  console.log("📌 Offset:", offset);

  // Validate query
  if (!query) {
    console.error("❌ Error: Query parameter is missing!");
    return res.status(400).json({ error: "Query parameter is required" });
  }

  console.log("🌍 Making request to YouTube API...");

  try {
    // Call YouTube API
    const response = await axios.get(`https://${RAPIDAPI_HOST}/search`, {
      params: {
        q: query,
        part: "snippet",
        type: "video",
        maxResults: 10,
        offset: parseInt(offset, 10),
      },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    console.log("✅ YouTube API Response Received!");
    console.log("📝 Full API Response:", JSON.stringify(response.data, null, 2));

    // Check if response contains data
    if (!response.data) {
      console.error("❌ API response is EMPTY!");
      return res.status(500).json({
        error: "Invalid response from YouTube API",
        details: "API returned no data",
      });
    }

    if (!response.data.items) {
      console.error("❌ No 'items' found in response!");
      return res.status(500).json({
        error: "Invalid response from YouTube API",
        details: response.data,
      });
    }

    console.log("🎥 Extracting video data...");
    const videoItems = response.data.items.map((video, index) => {
      console.log(`📌 Processing Video ${index + 1}:`, video.snippet?.title || "No title");

      return {
        id: video?.id?.videoId || "Unknown",
        title: video?.snippet?.title || "No title",
        description: video?.snippet?.description || "No description",
        thumbnails: video?.snippet?.thumbnails || {},
        channelTitle: video?.snippet?.channelTitle || "Unknown Channel",
        publishedAt: video?.snippet?.publishedAt || "Unknown Date",
      };
    });

    console.log("✅ Successfully extracted video data!");
    console.log("📊 Final Processed Video List:", JSON.stringify(videoItems, null, 2));

    console.log("🚀 Sending API Response...");
    return res.json({
      kind: "youtube#videoListResponse",
      items: videoItems,
      pageInfo: response.data.pageInfo || {},
    });

  } catch (error) {
    console.error("❌ YouTube API Error!");
    console.error("🛑 Error Message:", error.message);
    console.error("🔍 Error Details:", error.response?.data || "No additional details");

    return res.status(500).json({
      error: "Failed to fetch videos from YouTube",
      details: error.response?.data || error.message,
    });
  }
}
