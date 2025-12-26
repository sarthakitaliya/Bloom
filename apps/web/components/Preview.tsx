
export default function Preview({ url }: { url: string }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-black/40 border border-white/5 relative group">
      <div className="h-full w-full bg-white relative">
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