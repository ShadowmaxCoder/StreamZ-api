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

  const options = {
    method: "GET",
    url: `https://${RAPIDAPI_HOST}/search`,
    params: {
      q: query,
      part: "id,snippet",
      type: "video",
      maxResults: 12, // Fixed value, you can modify this as needed
      offset: parseInt(offset, 10), // Convert to integer
    },
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  };

  try {
    const { data } = await axios.request(options);

    const response = {
      kind: "youtube#videoListResponse",
      items: data.items.map((video) => ({
        kind: "youtube#video",
        id: video.id.videoId,
        snippet: {
          publishedAt: video.snippet.publishedAt,
          channelId: video.snippet.channelId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnails: video.snippet.thumbnails,
          channelTitle: video.snippet.channelTitle,
          tags: video.snippet.tags || [],
          categoryId: video.snippet.categoryId,
          liveBroadcastContent: video.snippet.liveBroadcastContent,
          localized: {
            title: video.snippet.title,
            description: video.snippet.description,
          },
        },
      })),
      pageInfo: {
        totalResults: data.pageInfo.totalResults,
        resultsPerPage: data.pageInfo.resultsPerPage,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("RapidAPI YouTube Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to fetch videos from YouTube",
      details: error.response?.data || error.message,
    });
  }
}
