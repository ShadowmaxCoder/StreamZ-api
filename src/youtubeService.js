import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const API_HOST = "youtube-v31.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;
const HEADERS = {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': API_HOST
};

// Fetch YouTube Videos
export async function fetchYouTubeVideos(query, pageToken = "") {
    const response = await fetch(`${BASE_URL}/search?q=${query}&part=id,snippet&type=video&maxResults=12&pageToken=${pageToken}`, { headers: HEADERS });
    const data = await response.json();
    return {
        items: data.items.map(video => ({
            id: video.id.videoId,
            snippet: video.snippet
        })),
        nextPageToken: data.nextPageToken || null
    };
}

// Fetch Video Details
export async function fetchVideoDetails(videoId) {
    const response = await fetch(`${BASE_URL}/videos?id=${videoId}&part=snippet,contentDetails,statistics`, { headers: HEADERS });
    const data = await response.json();
    if (!data.items.length) throw new Error("Video not found.");
    return data.items[0];
}

// Fetch Video Comments
export async function fetchVideoComments(videoId) {
    const response = await fetch(`${BASE_URL}/commentThreads?part=snippet&videoId=${videoId}&maxResults=50`, { headers: HEADERS });
    const data = await response.json();
    return data.items.map(comment => comment.snippet.topLevelComment.snippet);
}

// Fetch Channel Details
export async function fetchChannelDetails(channelId) {
    const response = await fetch(`${BASE_URL}/channels?id=${channelId}&part=snippet,statistics`, { headers: HEADERS });
    const data = await response.json();
    if (!data.items.length) throw new Error("Channel not found.");
    return data.items[0];
}

// Fetch Playlist Details
export async function fetchPlaylistDetails(playlistId) {
    const response = await fetch(`${BASE_URL}/playlists?id=${playlistId}&part=snippet,contentDetails`, { headers: HEADERS });
    const data = await response.json();
    if (!data.items.length) throw new Error("Playlist not found.");
    return data.items[0];
}

// Fetch Playlist Videos
export async function fetchPlaylistVideos(playlistId, pageToken = "") {
    const response = await fetch(`${BASE_URL}/playlistItems?playlistId=${playlistId}&part=snippet&maxResults=50&pageToken=${pageToken}`, { headers: HEADERS });
    const data = await response.json();
    return {
        items: data.items.map(item => ({
            id: item.id,
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId
        })),
        nextPageToken: data.nextPageToken || null
    };
}
