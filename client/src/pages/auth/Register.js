import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      login(data);
      toast.success(`Welcome, ${data.name}!`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-2xl mb-4">
            <span className="text-3xl">🚨</span>
          </div>
          <h1 className="text-3xl font-bold text-white">CrisisReport</h1>
          <p className="text-slate-400 mt-2">Join the community safety network</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Yashwin Fernando"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="077 123 4567"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          🔒 Your data is safe and secure
        </p>

      </div>
    </div>
  );
};

export default Register;