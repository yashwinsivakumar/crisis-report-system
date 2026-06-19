const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  deleteIncident,
  getIncidentStats,
} = require("../controllers/incidentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/stats", protect, adminOnly, getIncidentStats);
router.get("/", protect, getIncidents);
router.get("/:id", protect, getIncidentById);
router.post("/", protect, upload.single("image"), createIncident);
router.put("/:id", protect, adminOnly, updateIncidentStatus);
router.delete("/:id", protect, adminOnly, deleteIncident);

module.exports = router;