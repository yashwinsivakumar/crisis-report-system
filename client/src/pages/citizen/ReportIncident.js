import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../utils/api";
import toast from "react-hot-toast";

const incidentTypes = [
  { type: "Flood", icon: "🌊", color: "border-blue-400 bg-blue-50" },
  { type: "Fire", icon: "🔥", color: "border-red-400 bg-red-50" },
  { type: "Accident", icon: "🚗", color: "border-yellow-400 bg-yellow-50" },
  { type: "Landslide", icon: "⛰️", color: "border-orange-400 bg-orange-50" },
  { type: "Crime", icon: "🚔", color: "border-purple-400 bg-purple-50" },
  { type: "Other", icon: "⚠️", color: "border-gray-400 bg-gray-50" },
];

const severityLevels = [
  { level: "Low", color: "bg-green-100 text-green-700 border-green-300" },
  { level: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { level: "High", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { level: "Critical", color: "bg-red-100 text-red-700 border-red-300" },
];

const ReportIncident = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    severity: "Medium",
    latitude: "",
    longitude: "",
    image: null,
  });

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, type });
    setStep(2);
  };

  const handleSeveritySelect = (severity) => {
    setFormData({ ...formData, severity });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
        toast.success("Location detected! ✅");
      },
      (error) => {
        toast.error("Could not get location. Please enable GPS.");
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type) return toast.error("Please select incident type");
    if (!formData.description) return toast.error("Please add description");
    if (!formData.latitude) return toast.error("Please detect your location");

    setLoading(true);
    try {
      const data = new FormData();
      data.append("type", formData.type);
      data.append("description", formData.description);
      data.append("severity", formData.severity);
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      if (formData.image) data.append("image", formData.image);

      await api.post("/api/incidents", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Incident reported successfully! 🚨");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to report incident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Report Incident</h1>
          <p className="text-slate-500 mt-1">Help your community by reporting emergencies</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Type", "Details", "Location"].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step > i ? "text-accent" : "text-slate-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > i ? "bg-accent text-white" : 
                  step === i + 1 ? "bg-primary text-white" : "bg-slate-200"
                }`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-1 rounded ${step > i + 1 ? "bg-accent" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 — Select Type */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              What type of incident?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {incidentTypes.map(({ type, icon, color }) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`border-2 ${color} rounded-2xl p-4 text-center hover:scale-105 transition cursor-pointer`}
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="font-semibold text-slate-700 text-sm">{type}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Incident Details
            </h2>

            <div className="space-y-5">
              {/* Selected Type */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <span className="text-2xl">
                  {incidentTypes.find((t) => t.type === formData.type)?.icon}
                </span>
                <span className="font-semibold text-slate-700">{formData.type}</span>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-accent text-sm hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you see... (e.g. Water level is above knee height, road is completely blocked)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent transition resize-none"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {severityLevels.map(({ level, color }) => (
                    <button
                      key={level}
                      onClick={() => handleSeveritySelect(level)}
                      className={`border-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${color} ${
                        formData.severity === level ? "scale-105 shadow-md" : "opacity-60"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Photo (optional)
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => { setImagePreview(null); setFormData({ ...formData, image: null }); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-accent transition">
                    <span className="text-3xl mb-2">📷</span>
                    <span className="text-slate-500 text-sm">Tap to upload photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!formData.description}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-slate-700 transition disabled:opacity-50"
              >
                Next — Add Location →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Location & Submit */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Add Location
            </h2>

            <div className="space-y-5">
              {/* Location */}
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                {formData.latitude ? (
                  <div>
                    <p className="text-green-500 font-semibold text-lg">✅ Location Detected</p>
                    <p className="text-slate-500 text-sm mt-1">
                      {formData.latitude.toFixed(4)}°N, {formData.longitude.toFixed(4)}°E
                    </p>
                    <button
                      onClick={getLocation}
                      className="mt-2 text-accent text-sm hover:underline"
                    >
                      Refresh location
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-4xl mb-3">📍</p>
                    <p className="text-slate-500 text-sm mb-3">
                      We need your location to show this incident on the map
                    </p>
                    <button
                      onClick={getLocation}
                      disabled={locationLoading}
                      className="bg-accent text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {locationLoading ? "Detecting..." : "📍 Detect My Location"}
                    </button>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="font-semibold text-slate-700 mb-2">Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-medium">{formData.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Severity:</span>
                  <span className="font-medium">{formData.severity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Photo:</span>
                  <span className="font-medium">{formData.image ? "✅ Added" : "❌ Not added"}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.latitude}
                  className="flex-2 w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "🚨 Submit Report"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportIncident;