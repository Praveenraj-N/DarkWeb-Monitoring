import React, { useState } from "react";
import axios from "axios";

const ScanForm = ({ onScanComplete }) => {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("tor");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!url) return alert("Please enter a URL to scan");
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/api/search", {
        url,
        source,
      });
      alert("Scan scheduled successfully!");
      onScanComplete();
      setUrl("");
    } catch (err) {
      console.error(err);
      alert("Failed to start scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h2 className="text-lg font-semibold">Start New Scan</h2>
      <input
        type="text"
        placeholder="Enter dark web / onion URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border rounded-md w-full px-3 py-2"
      />
      <select
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="border rounded-md w-full px-3 py-2"
      >
        <option value="tor">Tor (.onion)</option>
        <option value="paste">Paste Site</option>
        <option value="clear">Clearnet</option>
      </select>

      <button
        onClick={handleScan}
        disabled={loading}
        className={`w-full py-2 rounded-md text-white ${
          loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Scanning..." : "Start Scan"}
      </button>
    </div>
  );
};

export default ScanForm;
