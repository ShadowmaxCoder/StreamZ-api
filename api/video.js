import { fetchVideoDetails } from "../youtubeService.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    
    const { videoId } = req.query;
    if (!videoId) {
        return res.status(400).json({ error: "Video ID parameter is required" });
    }

    try {
        const videoDetails = await fetchVideoDetails(videoId);
        res.json(videoDetails);
    } catch (error) {
        console.error("Error fetching video details:", error.message);
        res.status(500).json({ error: "Failed to fetch video details", details: error.message });
    }
}
