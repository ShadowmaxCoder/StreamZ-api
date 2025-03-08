import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "youtube-v31.p.rapidapi.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { query, offset = 0 } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const response = await axios.get(`https://${RAPIDAPI_HOST}/search`, {
      params: {
        q: query,
        part: "id,snippet",
        type: "video",
        maxResults: 12,
        offset: parseInt(offset, 10),
      },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    const data = response.data;

    if (!data || !data.items) {
      return res.status(500).json({ error: "Invalid response from YouTube API" });
    }

    return res.json({
      kind: "youtube#videoListResponse",
      items: data.items.map((video) => ({
        id: video?.id?.videoId || "Unknown",
        title: video?.snippet?.title || "No title",
        description: video?.snippet?.description || "No description",
        thumbnails: video?.snippet?.thumbnails || {},
        channelTitle: video?.snippet?.channelTitle || "Unknown Channel",
      })),
      pageInfo: {
        totalResults: data?.pageInfo?.totalResults || 0,
        resultsPerPage: data?.pageInfo?.resultsPerPage || 12,
      },
    });
  } catch (error) {
    console.error("YouTube API Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to fetch videos from YouTube",
      details: error.response?.data || error.message,
    });
  }
}
