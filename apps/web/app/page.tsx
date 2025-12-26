"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "../lib/auth-client";
import api from "../lib/axios";
import { useRouter } from "next/navigation";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";

type Project = {
  id: string;
  title: string;
  visibility: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    image: string | null;
  };
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"my" | "community">("my");
  const [filterVisibility, setFilterVisibility] = useState<
    "ALL" | "PUBLIC" | "PRIVATE"
  >("ALL");

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const params: any = {};

        if (activeTab === "community") {
          params.visibility = "PUBLIC";
        } else {
          if (filterVisibility === "PUBLIC") {
            params.visibility = "PUBLIC";
            params.filter = "mine";
          } else if (filterVisibility === "PRIVATE") {
            params.visibility = "PRIVATE";
            params.filter = "mine";
          }
          // For ALL, we don't send visibility params, so it returns all my projects
        }

        const { data } = await api.get("/projects", { params });
        if (data.success) {
          let fetchedProjects = data.data;

          setProjects(fetchedProjects);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    if (session) fetchProjects();
  }, [session, activeTab, filterVisibility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    if (!session) {
      await signIn.social({ provider: "google" });
      return;
    }

    setIsSubmitLoading(true);

    try {
      const { data } = await api.post("/projects", { prompt });
      if (data.success) {
        setPrompt("");
        router.push(`/projects/${data.data.project.id}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setIsSubmitLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />

      <Hero
        prompt={prompt}
        setPrompt={setPrompt}
        onSubmit={handleSubmit}
        loading={isSubmitLoading}
      />

      {/* Projects Section */}
      {session && (
        <section className="container mx-auto px-4 pb-20">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "my"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
              >
                My Projects
              </button>
              <button
                onClick={() => setActiveTab("community")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "community"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
              >
                Community
              </button>
            </div>

            {activeTab === "my" && (
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                {(["ALL", "PUBLIC", "PRIVATE"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterVisibility(filter)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${filterVisibility === filter
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:text-white"
                      }`}
                  >
                    {filter.toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loadingProjects ? (
            <div className="flex justify-center py-20">
              <Loader2 className="size-8 animate-spin text-indigo-500" />
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5"
            >
              <p className="text-muted-foreground">
                {activeTab === "my"
                  ? "No projects found. Create one above!"
                  : "No community projects found."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={project.id}
                  className="group relative bg-card hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden backdrop-blur-sm"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="size-5 text-indigo-400" />
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-300 font-bold border border-white/5 shadow-inner">
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                      {activeTab === 'community' && project.user && (
                        <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                          {project.user.image ? (
                            <img src={project.user.image} alt={project.user.name} className="size-4 rounded-full" />
                          ) : (
                            <div className="size-4 rounded-full bg-indigo-500/50" />
                          )}
                          <span className="text-xs text-muted-foreground max-w-[80px] truncate">{project.user.name}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-indigo-300 transition-colors truncate">
                      {project.title}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${project.visibility === "PUBLIC"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                            }`}
                        />
                        <span className="capitalize">{project.visibility.toLowerCase()}</span>
                      </div>
                      <span>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
