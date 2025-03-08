export default function handler(req, res) {
    res.status(200).json({
      message: "Welcome to the Home API!",
      status: "success",
      timestamp: Date.now(),
    });
  }
  import { fetchYouTubeVideos } from "../youtubeService.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const videos = await fetchYouTubeVideos(query);
        res.json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error.message);
        res.status(500).json({ error: "Failed to fetch videos", details: error.message });
    }
}
