import express from "express";
import User from "../models/User.js";
// Import the named export (verifyToken) instead of the default export
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/game/leaderboard - Get sorted leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    // Find all users with rhythm game scores
    const users = await User.find(
      { "rhythmGame.peakPLevel": { $gt: 0 } },
      "username rhythmGame"
    ).lean();

    // Sort by P-Level (primary) and difficulty (secondary)
    const sortedUsers = users.sort((a, b) => {
      // First compare by peak P-Level
      if (b.rhythmGame.peakPLevel !== a.rhythmGame.peakPLevel) {
        return b.rhythmGame.peakPLevel - a.rhythmGame.peakPLevel;
      }

      // If tied, compare by difficulty
      const difficultyRank = {
        hard: 3,
        normal: 2,
        easy: 1,
      };

      return (
        difficultyRank[b.rhythmGame.difficulty] -
        difficultyRank[a.rhythmGame.difficulty]
      );
    });

    res.json(sortedUsers);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/game/update-score - Update user's score
router.post("/update-score", verifyToken, async (req, res) => {
  try {
    const { score, difficulty } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update if the new score is higher
    if (!user.rhythmGame || score > user.rhythmGame.peakPLevel) {
      user.rhythmGame = {
        peakPLevel: score,
        difficulty: difficulty,
        lastPlayed: new Date(),
      };

      await user.save();
    }

    res.json({
      message: "Score updated successfully",
      peakPLevel: user.rhythmGame.peakPLevel,
      difficulty: user.rhythmGame.difficulty,
    });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
