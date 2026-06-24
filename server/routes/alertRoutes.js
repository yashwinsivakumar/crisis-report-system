const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// @desc    Get all alerts
// @route   GET /api/alerts
router.get("/", protect, async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create alert
// @route   POST /api/alerts
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, message, severity } = req.body;

    const alert = await Alert.create({
      title,
      message,
      severity,
      createdBy: req.user._id,
    });

    // Emit to all connected users
    req.io.emit("emergencyAlert", {
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      createdAt: alert.createdAt,
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;