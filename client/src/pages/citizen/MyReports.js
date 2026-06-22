import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const statusConfig = {
  Pending: {
    color: "bg-yellow-100 text-yellow-700",
    icon: "⏳",
  },
  Investigating: {
    color: "bg-blue-100 text-blue-700",
    icon: "🔍",
  },
  Resolved: {
    color: "bg-green-100 text-green-700",
    icon: "✅",
  },
};

const typeIcons = {
  Flood: "🌊",
  Fire: "🔥",
  Accident: "🚗",
  Landslide: "⛰️",
  Crime: "🚔",
  Other: "⚠️",
};

const MyReports = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const { data } = await api.get("/api/incidents");
      const myReports = data.filter(
        (incident) => incident.reportedBy?._id === user?._id
      );
      setIncidents(myReports);
    } catch (error) {
      toast.error("Failed to load your reports");
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents =
    filter === "All"
      ? incidents
      : incidents.filter((i) => i.status === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">My Reports</h1>
          <p className="text-slate-500 mt-1">
            Track all incidents you have reported
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {["Pending", "Investigating", "Resolved"].map((status) => (
            <div
              key={status}
              className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm"
            >
              <p className="text-2xl mb-1">{statusConfig[status].icon}</p>
              <p className="text-2xl font-bold text-slate-800">
                {incidents.filter((i) => i.status === status).length}
              </p>
              <p className="text-slate-500 text-sm">{status}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["All", "Pending", "Investigating", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === status
                  ? "bg-primary text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-slate-700 font-semibold text-lg">
              No reports found
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === "All"
                ? "You haven't reported any incidents yet"
                : `No ${filter} incidents`}
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
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-800">
                        {incident.type} Incident
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[incident.status]?.color}`}>
                        {statusConfig[incident.status]?.icon}{" "}
                        {incident.status}
                      </span>
                    </div>

                    <p className="text-slate-500 text-sm mb-3">
                      {incident.description}
                    </p>

                    {/* Image */}
                    {incident.imageUrl && (
                      <img
                        src={incident.imageUrl}
                        alt="incident"
                        className="w-full h-40 object-cover rounded-xl mb-3"
                      />
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          incident.severity === "Critical"
                            ? "bg-red-100 text-red-700"
                            : incident.severity === "High"
                            ? "bg-orange-100 text-orange-700"
                            : incident.severity === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {incident.severity}
                        </span>
                        <span className="text-xs text-slate-400">
                          📍 {incident.latitude?.toFixed(3)},{" "}
                          {incident.longitude?.toFixed(3)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(incident.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
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

export default MyReports;