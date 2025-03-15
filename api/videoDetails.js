import axios from "axios";
import Cors from "cors";
import { promisify } from "util";

// Configure CORS
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
    if (!RAPID_API_KEY_ALT) {
        console.error("🚨 API Key is missing! Ensure RAPID_API_KEY is set in environment variables.");
        throw new Error("Internal Server Error");
    }

    try {
        const { data } = await axios.get(url, {
            params,
            headers: {
                "x-rapidapi-key": RAPID_API_KEY_ALT,
                "x-rapidapi-host": RAPID_API_HOST_ALT,
            },
        });

        // Debugging response structure in non-production environments
        if (process.env.NODE_ENV !== "production") {
            console.log("✅ API Response:", JSON.stringify(data, null, 2));
        }

        return data;
    } catch (error) {
        console.error("❌ YouTube API Error:", error.response?.data || error.message);
        throw new Error("Failed to fetch data from YouTube API");
    }
}

/**
 * API Handler for fetching YouTube data.
 */
export default async function handler(req, res) {
    try {
        await cors(req, res);

        const { type, videoId } = req.query;

        // Validate request parameters
        if (!type) {
            return res.status(400).json({ error: "Request type is required" });
        }

        let url;
        let params = { geo: "IN", lang: "en", maxResults: 50 };

        switch (type) {
            case "videoDetails":
                if (!videoId) {
                    return res.status(400).json({ error: "Video ID is required" });
                }
                url = `https://${RAPID_API_HOST_ALT}/video`;
                params.id = videoId;
                break;

            default:
                return res.status(400).json({ error: "Invalid request type" });
        }

        const apiResponse = await fetchYouTubeData(url, params);

        // Validate API response structure
        if (!apiResponse || !apiResponse.id) {
            console.error("🚨 Unexpected API response format:", apiResponse);
            return res.status(500).json({ error: "Invalid API response format" });
        }

        // Log final response for debugging in non-production environments
        if (process.env.NODE_ENV !== "production") {
            console.log("🎥 Final Response:", JSON.stringify(apiResponse, null, 2));
        }

        return res.status(200).json({ response: apiResponse });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
