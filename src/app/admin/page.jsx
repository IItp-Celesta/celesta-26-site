"use client";

import { useState } from "react";

export default function AdminDashboard() {
  const [collection, setCollection] = useState("workshop_registrations");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // List of all your Firebase collections
  const collections = [
    { id: "workshop_registrations", name: "Workshop Registrations" },
    { id: "contact_messages", name: "Contact Form Messages" },
    { id: "users", name: "Registered Users (Main App)" },
    { id: "payments", name: "All Payments Logs" },
  ];

  const handleExport = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // 1. Call the API route we created earlier
      const response = await fetch(`/api/admin/export?collection=${collection}`);

      if (!response.ok) {
        throw new Error("Failed to export data or collection is empty.");
      }

      // 2. Convert the response into a downloadable Blob
      const blob = await response.blob();
      
      // 3. Create a temporary hidden link in the browser to force the download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${collection}_export_${new Date().toISOString().split('T')[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      
      // 4. Clean up the temporary link
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setStatus({ type: "success", message: "Download started successfully!" });
    } catch (error) {
      console.error("Download Error:", error);
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest uppercase mb-2">
            Admin Terminal
          </h1>
          <p className="text-gray-400 text-sm">
            Export database collections directly to CSV/Excel.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">
              Select Data Collection
            </label>
            <div className="relative">
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-400 transition-colors cursor-pointer"
              >
                {collections.map((col) => (
                  <option key={col.id} value={col.id} className="bg-gray-900">
                    {col.name}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3
              ${loading 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/10" 
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4)] hover:-translate-y-1"
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Extracting Data...
              </>
            ) : (
              "Download CSV"
            )}
          </button>

          {/* Status Messages */}
          {status.message && (
            <div className={`p-4 rounded-xl text-sm text-center font-medium animate-in fade-in ${
              status.type === "success" 
                ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30" 
                : "bg-red-900/30 text-red-400 border border-red-500/30"
            }`}>
              {status.message}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}