const express = require("express");
const { searchVideos } = require("./controllers");

const router = express.Router();

router.get("/search", searchVideos);

module.exports = router;
