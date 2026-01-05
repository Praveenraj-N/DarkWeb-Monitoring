import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Dashboard = ({ onLogout }) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      alert("Please enter a keyword!");
      return;
    }

    setLoading(true);
    setScanning(true);

    try {
      const res = await axios.post("http://localhost:8000/api/search", {
        keyword,
      });
      setResults(res.data.results || []);
    } catch (err) {
      console.error(err);
      alert("Failed to search keyword.");
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center p-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-5xl mb-8">
        <h1 className="text-3xl font-bold tracking-wide text-cyan-400 drop-shadow-lg">
          🛡️ Darkweb Monitoring Dashboard
        </h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-md font-semibold text-sm"
        >
          Logout
        </button>
      </div>

      {/* Radar Scan Animation */}
      {scanning && (
        <div className="relative flex justify-center items-center mb-8">
          <div className="w-40 h-40 rounded-full border-4 border-cyan-500 opacity-40 animate-ping"></div>
          <div className="absolute w-20 h-20 bg-cyan-400 rounded-full blur-lg animate-pulse opacity-60"></div>
          <p className="absolute mt-48 text-cyan-300 animate-pulse font-semibold">
            Scanning Darkweb for threats...
          </p>
        </div>
      )}
	{/* Continuous Monitoring Section */}
<div className="bg-white/10 backdrop-blur-lg border border-gray-700 shadow-xl rounded-2xl p-6 w-full max-w-3xl mb-10">
  <h2 className="text-xl font-semibold text-center mb-6 text-cyan-300">
    Start Darkweb Continuous Scan
  </h2>

  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
    <input
      type="text"
      placeholder="Enter dark web / onion URL"
      id="scanUrl"
      className="p-3 rounded-md bg-gray-900 text-white border border-cyan-500 w-full focus:ring-2 focus:ring-cyan-400 outline-none"
    />
    <button
      onClick={async () => {
        const url = document.getElementById("scanUrl").value;
        if (!url.trim()) return alert("Please enter a URL!");
        setScanning(true);
        try {
          await axios.post("http://localhost:8000/api/scan", {
            url,
            source: "manual",
          });
          alert("✅ Scan started successfully!");
        } catch (err) {
          console.error(err);
          alert("❌ Failed to start scan");
        } finally {
          setScanning(false);
        }
      }}
      className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold transition"
    >
      Start Scan
    </button>
  </div>

  <p className="text-gray-400 text-sm text-center mt-3">
    🛰 Continuously monitors the dark web for leaks on the given URL.
  </p>
</div>


      {/* Keyword Search Section */}
      <div className="bg-white/10 backdrop-blur-lg border border-gray-700 shadow-xl rounded-2xl p-6 w-full max-w-3xl mb-10">
        <h2 className="text-xl font-semibold text-center mb-6 text-cyan-300">
          Darkweb Keyword Search & Telegram Alert
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input
            type="text"
            placeholder="Enter a keyword (e.g. password, bank, leak)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="p-3 rounded-md bg-gray-900 text-white border border-cyan-500 w-full focus:ring-2 focus:ring-cyan-400 outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`px-6 py-3 rounded-md font-semibold transition text-white ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {loading ? "Searching..." : "Search Keyword"}
          </button>
        </div>
      </div>

      {/* Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        {results.length > 0 ? (
          <table className="min-w-full text-center border border-gray-700 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-cyan-900/80 text-cyan-200 uppercase">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2 text-left">Website</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Telegram</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={i}
                  className={`${
                    r.found
                      ? "bg-red-900/40 border-b border-gray-700"
                      : "bg-green-900/30 border-b border-gray-800"
                  } hover:bg-gray-800 transition`}
                >
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline"
                    >
                      {r.url}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    {r.found ? (
                      <span className="text-red-400 font-semibold">⚠ Found</span>
                    ) : (
                      <span className="text-green-400 font-semibold">✅ Safe</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {r.telegram_status.includes("🚨") ? (
                      <span className="bg-red-600/60 text-white px-3 py-1 rounded-md text-sm">
                        🚨 Alert Sent
                      </span>
                    ) : (
                      <span className="bg-green-600/60 text-white px-3 py-1 rounded-md text-sm">
                        🤖 No Alert
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center mt-10">
            🔍 Enter a keyword and click “Search Keyword” to begin analysis.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
