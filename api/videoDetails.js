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
 * @returns {Promise<Object>} - API response data.
 */
async function fetchYouTubeData(url, params = {}) {
    if (!RAPID_API_KEY_ALT) throw new Error("🚨 API Key is missing! Set RAPID_API_KEY in environment variables.");

    try {
        const { data } = await axios.get(url, {
            params,
            headers: {
                "x-rapidapi-key": RAPID_API_KEY_ALT,
                "x-rapidapi-host": RAPID_API_HOST_ALT,
            },
        });

        console.log("✅ API Response:", JSON.stringify(data, null, 2)); // Debugging response structure
        return data; // Changed from `data.data` to `data`
    } catch (error) {
        console.error("❌ YouTube API Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch data from YouTube API");
    }
}

/**
 * API Handler for fetching YouTube data.
 */
export default async function handler(req, res) {
    await cors(req, res);
    
    const { type, videoId } = req.query;

    let url;
    let params = { geo: "IN", lang: "en", maxResults: 50 };

    if (type === "videoDetails") {
        if (!videoId) return res.status(400).json({ error: "Video ID is required" });

        url = `https://${RAPID_API_HOST_ALT}/video`;
        params.id = videoId;
    } else {
        return res.status(400).json({ error: "Invalid request type" });
    }

    try {
        const apiResponse = await fetchYouTubeData(url, params);
        
        if (!apiResponse || !apiResponse.id) {  // Check if response has valid video details
            console.error("🚨 Invalid API response format:", apiResponse);
            return res.status(500).json({ error: "Unexpected API response format" });
        }
        
        console.log("🎥 Final Response:", JSON.stringify(apiResponse, null, 2)); // Debugging output
        
        res.status(200).json({ response: apiResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
