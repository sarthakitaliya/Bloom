"use client";

import { useSession } from "../lib/auth-client";
import { api } from "../lib/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { ProjectCard } from "../components/ProjectCard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
  _count?: {
    conversations: number;
  };
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"mine" | "community">("mine");
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [authPopup, setAuthPopup] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get("/projects", {
          params: {
            filter: activeTab,
          }
        });
        if (res.data.success) {
          setProjects(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
        toast.error("An error occurred while loading projects.");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [activeTab, session]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    if (!session) {
      toast.error("Please log in to start building.");
      return;
    }

    try {
      setIsSubmitLoading(true);
      toast.success("Creating your project...");
      const res = await api.post("/projects", {
        prompt,
      });
      if (res.data.success) {
        router.push(`/projects/${res.data.data.project.id}`);
      }
    } catch (error: any) {
      console.error("Failed to create project", error);
      toast.error(error.response?.data?.message || "Something went wrong while creating your project.");
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-black text-white selection:bg-indigo-500/30">
      <Header authPopup={authPopup} setAuthPopup={setAuthPopup} />

      <main className="flex-1 flex flex-col pt-14">
        <Hero
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          loading={isSubmitLoading}
        />

        <div className="w-full max-w-7xl mx-auto px-6 pb-20">
          <div className="flex items-center border-b border-white/10 mb-8">
            <button
              onClick={() => setActiveTab("mine")}
              className={`px-4 py-3 text-sm font-medium transition-all relative cursor-pointer ${activeTab === "mine"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              Your Projects
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`px-4 py-3 text-sm font-medium transition-all relative cursor-pointer ${activeTab === "community"
                ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              Community
            </button>
          </div>

          {!session ? (
            <div className="col-span-full py-24 text-center border border-dashed border-white/5 rounded-3xl bg-zinc-900/10">
              <p className="text-zinc-400 mb-4">Please log in to view {activeTab === "mine" ? "your work" : "the community gallery"}.</p>
              <button
                onClick={() => setAuthPopup(true)}
                className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Sign in to Bloom
              </button>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex justify-center p-20">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isOwner={activeTab === "mine"}
                      onDelete={handleDeleteProject}
                    />
                  ))}

                  {projects.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/20">
                      <p className="text-zinc-500 mb-2">No projects found.</p>
                      {activeTab === "mine" && (
                        <p className="text-zinc-600 text-sm">Start by creating one with the prompt above!</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
