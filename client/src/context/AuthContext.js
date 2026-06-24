import React, { createContext, useState, useContext, useEffect } from "react";
import socket from "../utils/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Socket.io listeners
  useEffect(() => {
    // New incident reported
    socket.on("newIncident", (incident) => {
      setNotification({
        type: "newIncident",
        message: `🚨 New ${incident.type} incident reported!`,
        incident,
      });
      setTimeout(() => setNotification(null), 5000);
    });

    // Incident status updated
    socket.on("incidentUpdated", (incident) => {
      setNotification({
        type: "incidentUpdated",
        message: `🔄 Incident status changed to ${incident.status}`,
        incident,
      });
      setTimeout(() => setNotification(null), 5000);
    });

    // Emergency alert
    socket.on("emergencyAlert", (alert) => {
      setNotification({
        type: "emergencyAlert",
        message: `⚠️ ${alert.title}: ${alert.message}`,
        alert,
      });
      setTimeout(() => setNotification(null), 10000);
    });

    return () => {
      socket.off("newIncident");
      socket.off("incidentUpdated");
      socket.off("emergencyAlert");
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, notification, setNotification }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);