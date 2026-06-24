import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import socket from "../../utils/socket";
import api from "../../utils/api";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load alerts from MongoDB on mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get("/api/alerts");
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  // Listen for new real-time alerts
  useEffect(() => {
    socket.on("emergencyAlert", (alert) => {
      console.log("Alert received!", alert);
      setAlerts((prev) => [
        {
          ...alert,
          _id: Date.now(),
          createdAt: new Date(),
        },
        ...prev,
      ]);
    });

    return () => {
      socket.off("emergencyAlert");
    };
  }, []);

  const severityColors = {
    Info: "bg-blue-50 border-blue-200 text-blue-800",
    Warning: "bg-amber-50 border-amber-200 text-amber-800",
    Critical: "bg-red-50 border-red-200 text-red-800",
  };

  const severityIcons = {
    Info: "ℹ️",
    Warning: "⚠️",
    Critical: "🚨",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              🔔 Emergency Alerts
            </h1>
            <p className="text-slate-500 mt-1">
              Live alerts broadcasted by authorities
            </p>
          </div>
          <button
            onClick={fetchAlerts}
            className="text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 text-sm font-medium">
            Listening for live alerts
          </span>
          {alerts.length > 0 && (
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
              {alerts.length} alert{alerts.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">🔕</p>
            <p className="text-slate-700 font-semibold text-lg">
              No alerts yet
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Emergency alerts from authorities will appear here instantly
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`border rounded-2xl p-5 ${severityColors[alert.severity] || severityColors.Warning}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">
                    {severityIcons[alert.severity] || "⚠️"}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">
                        {alert.title}
                      </h3>
                      <span className="text-xs opacity-70 font-medium px-2 py-1 rounded-full border">
                        {alert.severity || "Warning"}
                      </span>
                    </div>
                    <p className="mt-1 opacity-90">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs opacity-60">
                        🕐{" "}
                        {new Date(alert.createdAt).toLocaleString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {alert.createdBy && (
                        <p className="text-xs opacity-60">
                          👤 {alert.createdBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <p className="text-blue-700 text-sm">
            ℹ️ All alerts are saved and will be available even after
            you close the app. New alerts appear instantly in real time.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Alerts;