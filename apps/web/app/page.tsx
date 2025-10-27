"use client";

import { useState } from "react";
import { signIn, useSession } from "../lib/auth-client";
import Image from "next/image";
import api from "../lib/axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [authPopup, setAuthPopup] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleLogIn = async () => {
    await signIn.social({
      provider: "google",
    });
    setAuthPopup(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Prompt submitted:", prompt);
    try {
      const {data} = await api.post("/projects", { prompt });
      if(data.success) {
        setPrompt("");
        router.push(`/projects/${data.data.project.id}`);
      }else {
        //TODO: show error to user
        console.error("Failed to create project:", data.message);
      }
      console.log("Project created:", data);
    } catch (error) {
      //TODO: show error to user
      console.error("Error creating project:", error);
    }
  };
  return (
    <>
      {authPopup && !session && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setAuthPopup(false)}
        >
          <div
            className="bg-white rounded-lg p-8 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Authentication</h2>
            <button onClick={handleLogIn}>Continue with Google</button>
            <button
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded cursor-pointer"
              onClick={() => setAuthPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen w-full bg-gray-800 flex flex-col items-center">
        {/* Header */}
        <header className="w-full flex justify-between items-center px-8 py-6 bg-transparent">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Bloom</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Image
                  src={session.user?.image!}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full cursor-pointer hover:ring-1 hover:ring-gray-300"
                  width={200}
                  height={399}
                />
              </>
            ) : (
              <>
                <button
                  className="rounded-full bg-[#23243a] text-white px-4 py-2 font-semibold cursor-pointer"
                  onClick={() => setAuthPopup(true)}
                >
                  Log In
                </button>
                <button
                  className="rounded-full bg-[#23243a] text-white px-4 py-2 font-semibold cursor-pointer"
                  onClick={() => setAuthPopup(true)}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center flex-1 w-full mt-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 text-center">
            Build something <span className="text-pink-400">with</span> Bloom
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 text-center">
            Create apps and websites by chatting with AI
          </p>
          {/* Search Box */}
          <div className="bg-[#23243a] rounded-2xl shadow-lg flex flex-col md:flex-row items-center w-full max-w-xl p-6 mb-16">
            <form
              className="flex flex-1 w-full items-center"
              onSubmit={handleSubmit}
            >
              <input
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg px-2 py-2"
                placeholder="Ask Bloom to create a dashboard to..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
                type="submit"
              >
                <span>↑</span>
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
