import axios from "axios";
import cors from "cors";

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = "youtube-v31.p.rapidapi.com";

export default async function handler(req, res) {
    // Enable CORS
    await new Promise((resolve, reject) => {
        cors()(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
    });

    const videoId = req.query.id || req.url.split("/").pop();
    console.log("Requested Video ID:", videoId);

    if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
    }

    try {
        // Fetch video details from YouTube API
        const { data } = await axios.get(`https://${RAPID_API_HOST}/videos`, {
            params: {
                part: "snippet,contentDetails,statistics",
                id: videoId
            },
            headers: {
                "x-rapidapi-key": RAPID_API_KEY,
                "x-rapidapi-host": RAPID_API_HOST
            }
        });

        if (!data.items || data.items.length === 0) {
            return res.status(404).json({ error: "Video not found" });
        }

        const video = data.items[0];
        const response = {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            publishedAt: video.snippet.publishedAt,
            channelId: video.snippet.channelId,
            channelTitle: video.snippet.channelTitle,
            thumbnail: video.snippet.thumbnails.high.url,
            duration: video.contentDetails.duration,
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount,
            commentCount: video.statistics.commentCount
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching video details:", error.message);
        res.status(500).json({
            error: "Failed to fetch video details",
            details: error.response?.data?.message || error.message
        });
    }
}
