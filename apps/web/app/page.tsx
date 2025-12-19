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
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const { data } = await api.get("/projects");
        if (data.success) {
          setProjects(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    if (session) fetchProjects();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    if (!session) {
      await signIn.social({ provider: "google" });
      return;
    }

    try {
      const { data } = await api.post("/projects", { prompt });
      if (data.success) {
        setPrompt("");
        router.push(`/projects/${data.data.project.id}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />

      <Hero prompt={prompt} setPrompt={setPrompt} onSubmit={handleSubmit} />

      {/* Projects Section */}
      {session && (
        <section className="container mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Your Projects</h2>
          </motion.div>

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
              <p className="text-muted-foreground">No projects yet. Start by creating one above!</p>
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
                    <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 text-indigo-300 font-bold border border-white/5 shadow-inner">
                      {project.title.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-indigo-300 transition-colors truncate">{project.title}</h3>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${project.visibility === 'public' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="capitalize">{project.visibility}</span>
                      </div>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
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
