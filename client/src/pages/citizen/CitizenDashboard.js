import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
);

const IncidentCard = ({ incident }) => {
  const typeConfig = {
    Flood: { color: "bg-blue-100 text-blue-700", icon: "🌊" },
    Fire: { color: "bg-red-100 text-red-700", icon: "🔥" },
    Accident: { color: "bg-yellow-100 text-yellow-700", icon: "🚗" },
    Landslide: { color: "bg-orange-100 text-orange-700", icon: "⛰️" },
    Crime: { color: "bg-purple-100 text-purple-700", icon: "🚔" },
    Other: { color: "bg-gray-100 text-gray-700", icon: "⚠️" },
  };

  const statusConfig = {
    Pending: "bg-yellow-100 text-yellow-700",
    Investigating: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };

  const config = typeConfig[incident.type] || typeConfig.Other;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.color}`}>
              {incident.type}
            </span>
            <p className="text-slate-800 font-medium mt-1">{incident.description}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusConfig[incident.status]}`}>
          {incident.status}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-slate-400 text-xs">
          📍 {incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)}
        </p>
        <p className="text-slate-400 text-xs">
          {new Date(incident.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/api/incidents");
      setIncidents(data.slice(0, 6));
    } catch (error) {
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  const pending = incidents.filter((i) => i.status === "Pending").length;
  const investigating = incidents.filter((i) => i.status === "Investigating").length;
  const resolved = incidents.filter((i) => i.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome Banner */}
        <div className="bg-primary rounded-2xl p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-slate-300 mt-1">
            Help keep your community safe by reporting incidents.
          </p>
          <Link
            to="/report"
            className="inline-block mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold transition"
          >
            🚨 Report Incident
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Pending" value={pending} color="text-yellow-500" icon="⏳" />
          <StatCard label="Investigating" value={investigating} color="text-blue-500" icon="🔍" />
          <StatCard label="Resolved" value={resolved} color="text-green-500" icon="✅" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Report", icon: "🚨", path: "/report", color: "bg-red-500" },
            { label: "Map View", icon: "🗺️", path: "/map", color: "bg-blue-500" },
            { label: "My Reports", icon: "📋", path: "/my-reports", color: "bg-purple-500" },
            { label: "Alerts", icon: "🔔", path: "/alerts", color: "bg-amber-500" },
          ].map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className={`${action.color} rounded-2xl p-5 text-white text-center hover:opacity-90 transition shadow-sm`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <p className="font-semibold text-sm">{action.label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Incidents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Incidents</h2>
            <Link to="/map" className="text-accent text-sm font-medium hover:underline">
              View on map →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-500">No incidents reported yet</p>
              <Link to="/report" className="text-accent font-medium hover:underline">
                Be the first to report one
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incidents.map((incident) => (
                <IncidentCard key={incident._id} incident={incident} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CitizenDashboard;