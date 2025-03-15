import axios from "axios";
import Cors from "cors";
import { promisify } from "util";
import NodeCache from "node-cache"; // Import caching library

const cors = promisify(Cors({ methods: ["GET"] }));

// Secure API Key for the Alternative YouTube API
const RAPID_API_KEY_ALT = process.env.RAPID_API_KEY;
const RAPID_API_HOST_ALT = "youtube-v3-alternative.p.rapidapi.com";

// Initialize cache (Expires in 3 hours = 10,800 seconds, Check every 30 min = 1,800 sec)
const cache = new NodeCache({ stdTTL: 10800, checkperiod: 1800 });

/**
 * Fetch YouTube data from the alternative API with caching.
 * @param {string} url - API endpoint URL.
 * @param {Object} params - Query parameters.
 * @returns {Promise<Object>} - API response data.
 */
async function fetchYouTubeData(url, params = {}) {
    if (!RAPID_API_KEY_ALT) throw new Error("🚨 API Key is missing! Set RAPID_API_KEY in environment variables.");

    const cacheKey = `${url}-${JSON.stringify(params)}`;
    
    // Check if data exists in cache
    if (cache.has(cacheKey)) {
        console.log("⚡ Serving from cache:", cacheKey);
        return cache.get(cacheKey);
    }

    try {
        const { data } = await axios.get(url, {
            params,
            headers: {
                "x-rapidapi-key": RAPID_API_KEY_ALT,
                "x-rapidapi-host": RAPID_API_HOST_ALT,
            },
        });

        console.log("✅ API Response:", JSON.stringify(data, null, 2));

        // Store response in cache for 3 hours
        cache.set(cacheKey, data);

        return data;
    } catch (error) {
        console.error("❌ YouTube API Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch data from YouTube API");
    }
}

/**
 * API Handler for fetching YouTube data with caching.
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
        
        if (!apiResponse || !apiResponse.id) {
            console.error("🚨 Invalid API response format:", apiResponse);
            return res.status(500).json({ error: "Unexpected API response format" });
        }
        
        console.log("🎥 Final Response:", JSON.stringify(apiResponse, null, 2));

        res.status(200).json({ response: apiResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
