export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const videos = [
            { id: 1, title: "Sample Video 1", url: "/videos/sample1.mp4" },
            { id: 2, title: "Sample Video 2", url: "/videos/sample2.mp4" }
        ];

        res.status(200).json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
