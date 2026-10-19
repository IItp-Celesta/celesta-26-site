"use client";
import { useState } from "react";
import { Bed, Ticket, Trophy, Wrench} from "lucide-react";
import toast from "react-hot-toast";

const BUTTONS = [
  {
    type: "accom",
    label: "Hostel Sheet",
    desc: "Accommodation",
    icon: Bed,
    color: "amber",
    cls: "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20",
  },
  {
    type: "pronite",
    label: "Pronite Pass Sheet",
    desc: "Gate entry",
    icon: Ticket,
    color: "purple",
    cls: "bg-purple-500/10 text-purple-500 border-purple-500/30 hover:bg-purple-500/20",
  },
  {
    type: "events",
    label: "Event Sheet",
    desc: "Teams & members",
    icon: Trophy,
    color: "cyan",
    cls: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/20",
  },
  {
    type: "reg",
    label: "Workshop Sheet",
    desc: "Workshop registrations & payments",
    icon: Wrench,
    color: "emerald",
    cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20",
  },
];

export default function AdminDashboard() {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const response = await fetch(`/api/admin/export?type=${type}`);
      if (!response.ok) throw new Error("Failed to export data.");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `celesta_${type}_data_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Export generated and downloaded successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to export data.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-md w-full text-center">
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Data Terminal</h1>
        </div>
        
        <div className="flex flex-col gap-4 w-full">
          {BUTTONS.map(({ type, label, desc, icon: Icon, cls }) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              disabled={exporting !== null}
              className={`w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg border disabled:opacity-50 ${cls}`}
            >
              <Icon size={20} className={exporting === type ? "animate-pulse" : ""} />
              <div className="flex flex-col items-start">
                <span>{exporting === type ? "Generating..." : label}</span>
                <span className="text-xs font-normal opacity-60">{desc}</span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}