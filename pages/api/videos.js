import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const API_KEY = process.env.RAPIDAPI_KEY; // Make sure this is set
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing RAPIDAPI_KEY" });
    }

    const response = await axios.get("https://youtube-v31.p.rapidapi.com/search", {
      params: {
        part: "snippet",
        maxResults: 10,
        q: "trending",
      },
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "youtube-v31.p.rapidapi.com",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching videos:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
}
