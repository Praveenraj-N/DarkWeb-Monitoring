import React, { useEffect, useState } from "react";

const LiveFeed = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/live");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [data, ...prev].slice(0, 10)); // Keep recent 10
    };

    ws.onclose = () => console.log("WebSocket closed");
    return () => ws.close();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow h-80 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Live Feed</h2>
      <ul className="space-y-2">
        {messages.length === 0 && (
          <li className="text-gray-400">Waiting for updates...</li>
        )}
        {messages.map((msg, idx) => (
          <li
            key={idx}
            className="bg-gray-100 px-3 py-2 rounded text-sm border border-gray-200"
          >
            <strong>{msg.source || "System"}:</strong> {msg.title || msg.url}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveFeed;
