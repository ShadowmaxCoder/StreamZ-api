import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'a795c68509msh32efefe1c84b123p16d7a5jsnaeccde4317d4';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "https://youtube-v31.p.rapidapi.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const response = await axios.get(`https://${RAPIDAPI_HOST}/search`, {
      params: {
        q: query,
        part: "snippet",
        maxResults: 10,
      },
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    if (!response.data.items.length) {
      return res.status(404).json({ error: "No videos found for the query" });
    }

    const videos = response.data.items.map((video) => ({
      id: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      channel: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
    }));

    return res.json(videos);
  } catch (error) {
    console.error("YouTube API error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
