import express from "express";
import dotenv from "dotenv";
import youtubeRoutes from "./routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use("/api", youtubeRoutes);

app.get("/", (req, res) => res.send("YouTube API Server Running 🚀"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
