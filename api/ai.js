import axios from "axios";
import Cors from "cors";
import { promisify } from "util";

const cors = promisify(Cors({ methods: ["GET"] }));

/**
 * Fetch YouTube AI search suggestions
 * @param {string} query - Search term
 * @returns {Promise<string[]>} - List of AI-powered search suggestions
 */
async function fetchVideoSearchSuggestions(query) {
    try {
        const url = `https://suggestqueries.google.com/complete/search`;
        const params = { client: "youtube", ds: "yt", q: query, hl: "en" };

        const { data } = await axios.get(url, { params });

        console.log("🔍 Raw YouTube Suggest API Response:", data); // Debugging

        // ✅ Extract JSON from the wrapped function call
        const match = data.match(/window\.google\.ac\.h\((.+)\)/);
        if (!match || match.length < 2) {
            throw new Error("Invalid API response format");
        }

        // ✅ Convert to JSON
        const parsedData = JSON.parse(match[1]);

        // ✅ Extract search suggestions (located at `parsedData[1]`)
        return parsedData[1]?.map((suggestion) => suggestion[0]) || [];
    } catch (error) {
        console.error("❌ Suggest API Error:", error.message);
        throw new Error("Failed to fetch search suggestions");
    }
}

export default async function handler(req, res) {
    await cors(req, res);

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Search query is required" });
    }

    try {
        const suggestions = await fetchVideoSearchSuggestions(query);

        if (!Array.isArray(suggestions)) {
            console.error("🚨 Invalid API Response Format:", suggestions);
            return res.status(500).json({ error: "Unexpected API response format" });
        }

        res.status(200).json({ suggestions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
