import { fetchVideoComments } from "../youtubeService.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    
    const { videoId, maxResults = 50, pageToken } = req.query;
    if (!videoId) {
        return res.status(400).json({ error: "Video ID parameter is required" });
    }

    try {
        const comments = await fetchVideoComments(videoId, maxResults, pageToken);
        res.json({
            kind: "youtube#commentThreadListResponse",
            items: comments.items,
            nextPageToken: comments.nextPageToken,
            pageInfo: comments.pageInfo
        });
    } catch (error) {
        console.error("Error fetching video comments:", error.message);
        res.status(500).json({ error: "Failed to fetch video comments", details: error.message });
    }
}
