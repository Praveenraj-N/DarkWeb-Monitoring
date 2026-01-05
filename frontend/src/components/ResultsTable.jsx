// frontend/src/components/ResultsTable.jsx

import React from "react";

const ResultsTable = ({ results }) => {
  if (!results.length)
    return <p className="text-gray-500 text-center mt-4">No results found.</p>;

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Source</th>
            <th className="px-4 py-2 text-left">URL</th>
            <th className="px-4 py-2 text-center">Flagged</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr
              key={r.id}
              className={`transition duration-150 ${
                r.flagged
                  ? "bg-red-50 hover:bg-red-100"
                  : "bg-white hover:bg-gray-100"
              } border-b`}
            >
              <td className="px-4 py-2 text-center">{i + 1}</td>
              <td className="px-4 py-2 text-left font-medium text-gray-800">
                {r.title || "N/A"}
              </td>
              <td className="px-4 py-2 text-left capitalize">{r.source}</td>
              <td className="px-4 py-2 text-left truncate max-w-[250px]">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {r.url}
                </a>
              </td>
              <td className="px-4 py-2 text-center font-semibold">
                {r.flagged ? (
                  <span className="inline-flex items-center justify-center gap-1 bg-red-200 text-red-800 text-sm px-2 py-1 rounded-lg">
                    ⚠️ Alert
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-1 bg-green-200 text-green-800 text-sm px-2 py-1 rounded-lg">
                    ✅ Safe
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
