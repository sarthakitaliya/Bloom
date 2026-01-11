import { Loader2 } from "lucide-react";

export default function Preview({ url }: { url: string }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-black/40 border border-white/5 relative group">
      <div className="h-full w-full bg-white relative">
        {url ? (
          <iframe
            src={url}
            title="Project Preview"
            className="size-full border-none"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-400">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-300 mb-1">Building your project...</p>
                <p className="text-xs text-zinc-500">This may take a few moments</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}