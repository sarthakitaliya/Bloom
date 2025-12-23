
export default function Preview({ url }: { url: string }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-black/40 border border-white/5 relative group">
      {/* Browser Chrome */}
      <div className="h-10 bg-[#18181b] flex items-center px-4 border-b border-white/5 gap-2">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500/20 group-hover:bg-red-500 transition-colors" />
          <div className="size-2.5 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500 transition-colors" />
          <div className="size-2.5 rounded-full bg-green-500/20 group-hover:bg-green-500 transition-colors" />
        </div>

        <div className="flex-1 flex justify-center">
          <div className="bg-black/50 rounded-full px-3 py-1 text-[10px] text-muted-foreground w-48 text-center truncate font-mono border border-white/5">
            {url || "localhost:3000"}
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-40px)] w-full bg-white relative">
        <iframe
          src={url}

          title="Project Preview"
          className="size-full border-none"
        />
        {!url && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
            Waiting for preview...
          </div>
        )}
      </div>
    </div>
  );
}