const Incident = require("../models/Incident");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Create a new incident
// @route   POST /api/incidents
const createIncident = async (req, res) => {
  try {
    const { type, description, latitude, longitude, severity } = req.body;

    let imageUrl = "";

    // If image is uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "crisis-report",
      });
      imageUrl = result.secure_url;
    }

    const incident = await Incident.create({
      type,
      description,
      latitude,
      longitude,
      severity,
      imageUrl,
      reportedBy: req.user._id,
    });

    // Emit real-time event
    req.io.emit("newIncident", incident);

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all incidents
// @route   GET /api/incidents
const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update incident status
// @route   PUT /api/incidents/:id
const updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    incident.status = status;
    await incident.save();

    // Emit real-time update
    req.io.emit("incidentUpdated", incident);

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    await incident.deleteOne();
    res.json({ message: "Incident removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get incident statistics
// @route   GET /api/incidents/stats
const getIncidentStats = async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const floods = await Incident.countDocuments({ type: "Flood" });
    const fires = await Incident.countDocuments({ type: "Fire" });
    const accidents = await Incident.countDocuments({ type: "Accident" });
    const landslides = await Incident.countDocuments({ type: "Landslide" });
    const crimes = await Incident.countDocuments({ type: "Crime" });
    const pending = await Incident.countDocuments({ status: "Pending" });
    const investigating = await Incident.countDocuments({
      status: "Investigating",
    });
    const resolved = await Incident.countDocuments({ status: "Resolved" });

    res.json({
      total,
      byType: { floods, fires, accidents, landslides, crimes },
      byStatus: { pending, investigating, resolved },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  deleteIncident,
  getIncidentStats,
};