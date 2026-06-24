import React from "react";
import { useAuth } from "../context/AuthContext";

const Notification = () => {
  const { notification, setNotification } = useAuth();

  if (!notification) return null;

  const bgColors = {
    newIncident: "bg-red-500",
    incidentUpdated: "bg-blue-500",
    emergencyAlert: "bg-amber-500",
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 ${bgColors[notification.type]} text-white px-6 py-4 rounded-2xl shadow-2xl max-w-sm animate-bounce`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-semibold text-sm">{notification.message}</p>
        <button
          onClick={() => setNotification(null)}
          className="text-white opacity-70 hover:opacity-100 text-lg leading-none flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Notification;