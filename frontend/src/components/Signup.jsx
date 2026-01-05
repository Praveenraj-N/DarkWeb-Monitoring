import React, { useState } from "react";
import axios from "axios";

const Signup = ({ onSignupSuccess, switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/auth/signup", {
        username,
        password,
      });
      setMessage("✅ Signup successful! Redirecting...");
      setTimeout(() => onSignupSuccess?.(), 1500);
    } catch (err) {
      setMessage("⚠️ Username already exists or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen flex justify-center items-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover brightness-50"
      >
        <source src="/videos/cyber-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Signup Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-96 text-center border border-gray-300 animate-pulse-slow">
        <h2 className="text-2xl font-bold mb-6 text-white flex justify-center items-center gap-2">
          🛡️ Darkweb Monitor Signup
        </h2>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 rounded-md bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-md bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 rounded-md bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {message && <p className="text-blue-300 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-md text-white font-semibold transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Creating..." : "Signup"}
          </button>
        </form>

        <p className="text-gray-300 text-sm mt-4">
          Already have an account?{" "}
          <span
            onClick={switchToLogin}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Login here
          </span>
        </p>

        <p className="text-gray-400 text-xs mt-3">
          © 2025 Darkweb Monitor | Cyber Secure Gateway
        </p>
      </div>
    </div>
  );
};

export default Signup;
