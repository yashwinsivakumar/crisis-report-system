import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";
import toast from "react-hot-toast";

const typeIcons = {
  Flood: "🌊",
  Fire: "🔥",
  Accident: "🚗",
  Landslide: "⛰️",
  Crime: "🚔",
  Other: "⚠️",
};

const statusConfig = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Investigating: "bg-blue-100 text-blue-700 border-blue-200",
  Resolved: "bg-green-100 text-green-700 border-green-200",
};

const severityConfig = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      const { data } = await api.get(`/api/incidents/${id}`);
      setIncident(data);
    } catch (error) {
      toast.error("Failed to load incident");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      await api.put(`/api/incidents/${id}`, { status });
      setIncident({ ...incident, status });
      toast.success(`Status updated to ${status} ✅`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this incident?")) return;
    try {
      await api.delete(`/api/incidents/${id}`);
      toast.success("Incident deleted");
      navigate("/admin/incidents");
    } catch (error) {
      toast.error("Failed to delete incident");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-16">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-slate-700 font-semibold">Incident not found</p>
          <button
            onClick={() => navigate("/admin/incidents")}
            className="mt-4 text-accent hover:underline"
          >
            ← Back to incidents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/incidents")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-6"
        >
          ← Back to all incidents
        </button>

        {/* Header Card */}
        <div className="bg-primary rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl">
                {typeIcons[incident.type] || "⚠️"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{incident.type} Incident</h1>
                <p className="text-slate-300 text-sm mt-1">
                  ID: {incident._id}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${statusConfig[incident.status]}`}>
                {incident.status}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${severityConfig[incident.severity]}`}>
                {incident.severity} Severity
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-3">📝 Description</h2>
              <p className="text-slate-600 leading-relaxed">
                {incident.description}
              </p>
            </div>

            {/* Image */}
            {incident.imageUrl && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 mb-3">📷 Photo Evidence</h2>
                <img
                  src={incident.imageUrl}
                  alt="incident"
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
            )}

            {/* Location */}
<div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
  <h2 className="font-bold text-slate-800 mb-3">📍 Location</h2>

  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
    <span className="text-3xl">🗺️</span>

    <div>
      <p className="font-medium text-slate-700">Coordinates</p>
      <p className="text-slate-500 text-sm">
        {incident.latitude?.toFixed(6)}°N,{" "}
        {incident.longitude?.toFixed(6)}°E
      </p>
    </div>

    <a
      href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
      target="_blank"
      rel="noreferrer"
      className="ml-auto bg-accent text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition"
    >
      Open in Maps
    </a>
  </div>
</div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Reporter Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">👤 Reporter</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">
                  {incident.reportedBy?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {incident.reportedBy?.name}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {incident.reportedBy?.email}
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p>🕐 Reported: {new Date(incident.createdAt).toLocaleString()}</p>
                <p>🔄 Updated: {new Date(incident.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-4">
                🔧 Update Status
              </h2>
              <div className="space-y-2">
                {["Pending", "Investigating", "Resolved"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating || incident.status === status}
                    className={`w-full py-2 rounded-xl text-sm font-medium transition border ${
                      incident.status === status
                        ? statusConfig[status] + " cursor-default"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    } disabled:opacity-60`}
                  >
                    {incident.status === status ? "✓ " : ""}{status}
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h2 className="font-bold text-red-800 mb-3">⚠️ Danger Zone</h2>
              <button
                onClick={handleDelete}
                className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition"
              >
                🗑 Delete Incident
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;