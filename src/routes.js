import express from "express";
import {
    fetchYouTubeVideos,
    fetchVideoDetails,
    fetchVideoComments,
    fetchChannelDetails,
    fetchPlaylistDetails,
    fetchPlaylistVideos
} from "./youtubeService.js";

const router = express.Router();

router.get("/videos", async (req, res) => {
    const { query, pageToken } = req.query;
    try {
        const data = await fetchYouTubeVideos(query, pageToken);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/video/:id", async (req, res) => {
    try {
        const data = await fetchVideoDetails(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/video/:id/comments", async (req, res) => {
    try {
        const data = await fetchVideoComments(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/channel/:id", async (req, res) => {
    try {
        const data = await fetchChannelDetails(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/playlist/:id", async (req, res) => {
    try {
        const data = await fetchPlaylistDetails(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/playlist/:id/videos", async (req, res) => {
    const { pageToken } = req.query;
    try {
        const data = await fetchPlaylistVideos(req.params.id, pageToken);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
