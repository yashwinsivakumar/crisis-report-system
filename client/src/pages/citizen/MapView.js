import "leaflet/dist/leaflet.css";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";
import toast from "react-hot-toast";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom colored markers
const createIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:32px;
      height:32px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const typeColors = {
  Flood: "#3b82f6",
  Fire: "#ef4444",
  Accident: "#f59e0b",
  Landslide: "#f97316",
  Crime: "#8b5cf6",
  Other: "#6b7280",
};

const severityColors = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const typeIcons = {
  Flood: "🌊",
  Fire: "🔥",
  Accident: "🚗",
  Landslide: "⛰️",
  Crime: "🚔",
  Other: "⚠️",
};

const MapView = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

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

  const filteredIncidents = filter === "All"
    ? incidents
    : incidents.filter((i) => i.type === filter);

  // Center map on Sri Lanka
  const center = [7.8731, 80.7718];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Incident Map</h1>
            <p className="text-slate-500 text-sm mt-1">
              {filteredIncidents.length} incidents shown
            </p>
          </div>
          <button
            onClick={fetchIncidents}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["All", "Flood", "Fire", "Accident", "Landslide", "Crime", "Other"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                filter === type
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary"
              }`}
            >
              {typeIcons[type] || "🗺️"} {type}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: color }}
              />
              <span className="text-xs text-slate-500">{type}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        {loading ? (
          <div className="flex justify-center items-center h-96 bg-white rounded-2xl border border-slate-100">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
            style={{ height: "500px" }}>
            <MapContainer
              center={center}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
              key="map"
              center={center}
              zoom={8}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredIncidents.map((incident) => (
                incident.latitude && incident.longitude && (
                  <Marker
                    key={incident._id}
                    position={[incident.latitude, incident.longitude]}
                    icon={createIcon(typeColors[incident.type] || typeColors.Other)}
                  >
                    <Popup>
                      <div className="p-1 min-w-48">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">
                            {typeIcons[incident.type]}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">
                              {incident.type}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColors[incident.severity]}`}>
                              {incident.severity}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">
                          {incident.description}
                        </p>
                        {incident.imageUrl && (
                          <img
                            src={incident.imageUrl}
                            alt="incident"
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                        )}
                        <div className="border-t pt-2 mt-2">
                          <p className="text-xs text-slate-400">
                            Reported by: {incident.reportedBy?.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                            incident.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : incident.status === "Investigating"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        )}

        {/* Incident Count Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6">
          {Object.entries(typeColors).map(([type, color]) => {
            const count = incidents.filter((i) => i.type === type).length;
            return (
              <div
                key={type}
                className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm"
              >
                <p className="text-2xl">{typeIcons[type]}</p>
                <p className="font-bold text-slate-800 text-lg">{count}</p>
                <p className="text-slate-500 text-xs">{type}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default MapView;