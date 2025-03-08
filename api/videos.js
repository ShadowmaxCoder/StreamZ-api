import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'a795c68509msh32efefe1c84b123p16d7a5jsnaeccde4317d4';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "https://youtube-v31.p.rapidapi.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
    const options = {
        method: 'GET',
        url: 'https://youtube-v31.p.rapidapi.com/search',
        params: {
            q: query,
            part: 'id,snippet',
            type: 'video',
            maxResults: '12',
            offset: 0 // Use the offset for pagination
        },
        headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'youtube-v31.p.rapidapi.com'
        }
    };

    try {
        const { data } = await axios.request(options);
        return {
            kind: "youtube#videoListResponse",
            items: data.items.map((video) => ({
                kind: "youtube#video",
                id: video.id.videoId,
                snippet: {
                    publishedAt: video.snippet.publishedAt,
                    channelId: video.snippet.channelId,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnails: video.snippet.thumbnails,
                    channelTitle: video.snippet.channelTitle,
                    tags: video.snippet.tags || [],
                    categoryId: video.snippet.categoryId,
                    liveBroadcastContent: video.snippet.liveBroadcastContent,
                    localized: {
                        title: video.snippet.title,
                        description: video.snippet.description
                    }
                }
            })),
            pageInfo: {
                totalResults: data.pageInfo.totalResults,
                resultsPerPage: data.pageInfo.resultsPerPage
            }
        };
    } catch (error) {
        console.error('RapidAPI YouTube Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch videos from YouTube");
    }
}
