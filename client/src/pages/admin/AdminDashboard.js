import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";
import toast from "react-hot-toast";
import socket from "../../utils/socket";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const StatCard = ({ label, value, color, icon, bg }) => (
  <div className={`${bg} rounded-2xl p-6 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
);

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#f97316", "#8b5cf6", "#6b7280"];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertForm, setAlertForm] = useState({ title: "", message: "" });
  const [alertLoading, setAlertLoading] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);

  useEffect(() => {
    fetchData();
    fetchAlerts();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, incidentsRes] = await Promise.all([
        api.get("/api/incidents/stats"),
        api.get("/api/incidents"),
      ]);
      setStats(statsRes.data);
      setRecentIncidents(incidentsRes.data.slice(0, 5));
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get("/api/alerts");
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load alerts");
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.delete(`/api/alerts/${id}`);
      toast.success("Alert deleted ✅");
      fetchAlerts();
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const typeChartData = stats
    ? [
        { name: "Flood", value: stats.byType.floods },
        { name: "Fire", value: stats.byType.fires },
        { name: "Accident", value: stats.byType.accidents },
        { name: "Landslide", value: stats.byType.landslides },
        { name: "Crime", value: stats.byType.crimes },
      ]
    : [];

  const statusChartData = stats
    ? [
        { name: "Pending", value: stats.byStatus.pending },
        { name: "Investigating", value: stats.byStatus.investigating },
        { name: "Resolved", value: stats.byStatus.resolved },
      ]
    : [];

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Investigating: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };

  const typeIcons = {
    Flood: "🌊",
    Fire: "🔥",
    Accident: "🚗",
    Landslide: "⛰️",
    Crime: "🚔",
    Other: "⚠️",
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Monitor and manage all incidents
            </p>
          </div>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-semibold transition flex items-center gap-2"
          >
            🔔 Send Alert
          </button>
        </div>

        {/* Alert Form */}
        {showAlertForm && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-red-800 text-lg mb-4">
              📢 Broadcast Emergency Alert
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Alert title (e.g. Flood Warning in Colombo)"
                value={alertForm.title}
                onChange={(e) =>
                  setAlertForm({ ...alertForm, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <textarea
                placeholder="Alert message..."
                value={alertForm.message}
                onChange={(e) =>
                  setAlertForm({ ...alertForm, message: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlertForm(false)}
                  className="flex-1 border border-red-200 text-red-700 py-2 rounded-xl font-medium hover:bg-red-100 transition"
                >
                  Cancel
                </button>
                <button
                onClick={async () => {
  if (!alertForm.title || !alertForm.message) {
    toast.error("Please fill in all fields");
    return;
  }
  setAlertLoading(true);
  try {
    await api.post("/api/alerts", {
      title: alertForm.title,
      message: alertForm.message,
      severity: "Warning",
    });
    toast.success("Alert broadcasted and saved! 🚨");
    setAlertForm({ title: "", message: "" });
    setShowAlertForm(false);
  } catch (error) {
    toast.error("Failed to send alert");
  } finally {
    setAlertLoading(false);
  }
}}
                  disabled={alertLoading}
                  className="flex-1 bg-red-500 text-white py-2 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {alertLoading ? "Sending..." : "🚨 Broadcast Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Incidents"
            value={stats?.total || 0}
            color="text-slate-800"
            icon="📊"
            bg="bg-white border border-slate-100"
          />
          <StatCard
            label="Pending"
            value={stats?.byStatus.pending || 0}
            color="text-yellow-600"
            icon="⏳"
            bg="bg-yellow-50 border border-yellow-100"
          />
          <StatCard
            label="Investigating"
            value={stats?.byStatus.investigating || 0}
            color="text-blue-600"
            icon="🔍"
            bg="bg-blue-50 border border-blue-100"
          />
          <StatCard
            label="Resolved"
            value={stats?.byStatus.resolved || 0}
            color="text-green-600"
            icon="✅"
            bg="bg-green-50 border border-green-100"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">
              Incidents by Type
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {typeChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">
              Incidents by Status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#f59e0b", "#3b82f6", "#22c55e"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Recent Incidents</h3>
            <Link
              to="/admin/incidents"
              className="text-accent text-sm font-medium hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {recentIncidents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-slate-500">No incidents yet</p>
              </div>
            ) : (
              recentIncidents.map((incident) => (
                <div
                  key={incident._id}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                    {typeIcons[incident.type] || "⚠️"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      {incident.type} — {incident.description.slice(0, 50)}...
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      By {incident.reportedBy?.name} •{" "}
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[incident.status]}`}>
                    {incident.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Alerts Section */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">🔔 Active Alerts</h3>
            <span className="text-sm font-medium text-slate-500">
              {alerts.length} active
            </span>
          </div>

          <div className="p-6">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🔕</p>
                <p className="text-slate-500">No active alerts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-amber-100 bg-amber-50"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-2xl flex-shrink-0">⚠️</div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-amber-900">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-amber-800 mt-1 break-words">
                          {alert.message}
                        </p>
                        <p className="text-xs text-amber-700 mt-2">
                          🕐 {new Date(alert.createdAt).toLocaleString("en-US", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(alert._id)}
                      className="text-xs px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition flex-shrink-0"
                    >
                      🗑 Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;