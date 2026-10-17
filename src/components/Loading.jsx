import { Loader2 } from "lucide-react";

export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-teal-100">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
        <p className="text-lg font-medium uppercase tracking-widest">
          {message}
        </p>
      </div>
    </div>
  );
}