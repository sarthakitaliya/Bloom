
export default function Preview({ url }: { url: string }) {
  return (
    <div className="w-full h-full border border-gray-300 rounded-md overflow-hidden">   
        <iframe
          src={url}
          title="Project Preview"
          className="size-[99%] rounded-xl border border-gray-700 shadow-lg bg-white"
        />
    </div>
  );
}