export default function handler(req, res) {
    res.status(200).json({
      message: "Welcome to the Home API!",
      status: "success",
      timestamp: Date.now(),
    });
  }
  