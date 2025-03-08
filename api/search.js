import axios from "axios";
import Cors from "cors";
import { promisify } from "util";

const cors = promisify(Cors({ methods: ["GET"] }));

// Secure API Key for the Alternative YouTube API
const RAPID_API_KEY_ALT = process.env.RAPID_API_KEY;
const RAPID_API_HOST_ALT = "youtube-v3-alternative.p.rapidapi.com";

/**
 * Fetch YouTube data from the alternative API.
 * @param {string} url - API endpoint URL.
 * @param {Object} params - Query parameters.
 * @returns {Promise<Object[]>} - API response data.
 */
async function fetchYouTubeData(url, params = {}) {
    if (!RAPID_API_KEY_ALT) throw new Error("🚨 API Key is missing! Set RAPID_API_KEY_ALT in environment variables.");

    try {
        const { data } = await axios.get(url, {
            params,
            headers: {
                "x-rapidapi-key": RAPID_API_KEY_ALT,
                "x-rapidapi-host": RAPID_API_HOST_ALT,
            },
        });
        return data.data || [];
    } catch (error) {
        console.error("❌ YouTube API Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch data from YouTube API");
    }
}

export default async function handler(req, res) {
    await cors(req, res);
    
    const { type, query, videoId } = req.query;

    let url = `https://${RAPID_API_HOST_ALT}/search`;
    let params = { geo: "IN", lang: "en", maxResults: 50 };

    switch (type) {
        case "videos":
            if (!query) return res.status(400).json({ error: "Query is required" });
            params.query = query;
            break;

        case "music":
            params.query = "music";
            break;

        case "trending":
            url = `https://${RAPID_API_HOST_ALT}/trending`;
            break;

        case "recommended":
            params.query = "popular";
            break;

        case "live":
            params.query = "live";
            break;

        case "shorts":
            params.query = "%23shorts";
            break;

        case "suggestions":
            if (!query) return res.status(400).json({ error: "Query is required" });
            params.query = query;
            break;

        case "videoDetails":
            if (!videoId) return res.status(400).json({ error: "Video ID is required" });
            url = `https://${RAPID_API_HOST_ALT}/video`;
            params.id = videoId;
            break;

        default:
            return res.status(400).json({ error: "Invalid request type" });
    }

    try {
        const items = await fetchYouTubeData(url, params);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
