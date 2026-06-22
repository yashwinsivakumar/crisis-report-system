import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Pending: "bg-yellow-100 text-yellow-700",
  Investigating: "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
};

const severityConfig = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const IncidentList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data } = await api.get("/api/incidents");
      setIncidents(data);
    } catch (error) {
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/api/incidents/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchIncidents();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this incident?")) return;
    try {
      await api.delete(`/api/incidents/${id}`);
      toast.success("Incident deleted");
      fetchIncidents();
    } catch (error) {
      toast.error("Failed to delete incident");
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.description.toLowerCase().includes(search.toLowerCase()) ||
      incident.type.toLowerCase().includes(search.toLowerCase()) ||
      incident.reportedBy?.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || incident.type === typeFilter;
    const matchesStatus = statusFilter === "All" || incident.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              All Incidents
            </h1>
            <p className="text-slate-500 mt-1">
              {filteredIncidents.length} incidents found
            </p>
          </div>
          <button
            onClick={fetchIncidents}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="🔍 Search by type, description or reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            />

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            >
              {["All", "Flood", "Fire", "Accident", "Landslide", "Crime", "Other"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            >
              {["All", "Pending", "Investigating", "Resolved"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Incidents List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-slate-700 font-semibold text-lg">
              No incidents found
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <div
                key={incident._id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {typeIcons[incident.type] || "⚠️"}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">
                        {incident.type} Incident
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${severityConfig[incident.severity]}`}>
                        {incident.severity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[incident.status]}`}>
                        {incident.status}
                      </span>
                    </div>

                    <p className="text-slate-500 text-sm mb-2">
                      {incident.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>👤 {incident.reportedBy?.name}</span>
                      <span>📍 {incident.latitude?.toFixed(3)}, {incident.longitude?.toFixed(3)}</span>
                      <span>🕐 {new Date(incident.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}</span>
                    </div>

                    {/* Image */}
                    {incident.imageUrl && (
                      <img
                        src={incident.imageUrl}
                        alt="incident"
                        className="w-full h-40 object-cover rounded-xl mt-3"
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      to={`/admin/incidents/${incident._id}`}
                      className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-center"
                    >
                      👁 View
                    </Link>

                    {incident.status !== "Investigating" && (
                      <button
                        onClick={() => handleStatusUpdate(incident._id, "Investigating")}
                        className="text-xs px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition"
                      >
                        🔍 Investigate
                      </button>
                    )}

                    {incident.status !== "Resolved" && (
                      <button
                        onClick={() => handleStatusUpdate(incident._id, "Resolved")}
                        className="text-xs px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition"
                      >
                        ✅ Resolve
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(incident._id)}
                      className="text-xs px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentList;