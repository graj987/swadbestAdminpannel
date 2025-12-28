import React, { useEffect, useState } from "react";
import api from "../api";
import { Search } from "lucide-react";

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetch = async () => {
      try {
        const res = await api.get(`/api/admin/search?q=${query}`);
        setResults(res.data || []);
      } catch (e) {
        console.log("Search error", e);
      }
    };

    const t = setTimeout(fetch, 250);
    return () => clearTimeout(t);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
        
        {/* Search bar */}
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
          <Search size={18} className="text-gray-600" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, users..."
            className="w-full px-2 py-1 outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No results
            </div>
          ) : (
            results.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  window.location.href = r.link;
                  onClose();
                }}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b"
              >
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-gray-500">{r.type}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
