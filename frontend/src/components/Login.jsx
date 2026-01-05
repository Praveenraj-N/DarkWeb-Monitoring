import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin, switchToSignup }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", { username, password });
      localStorage.setItem("token", res.data.access_token);
      onLogin();
    } catch (err) {
      alert("❌ Invalid credentials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen flex justify-center items-center overflow-hidden">
      <video autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover brightness-50">
        <source src="/videos/cyber-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-gray-700 p-10 rounded-2xl shadow-2xl w-96 text-center">
        <h2 className="text-2xl font-bold mb-6 text-white">🔐 Darkweb Monitor Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-md text-white font-semibold transition ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-300 text-sm mt-4">
          Don’t have an account?{" "}
          <span onClick={switchToSignup} className="text-blue-400 hover:underline cursor-pointer">
            Signup here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
