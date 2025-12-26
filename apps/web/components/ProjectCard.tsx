import { ArrowUpRight, Copy, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        description: string | null;
        visibility: "PUBLIC" | "PRIVATE";
        userId: string;
        user: {
            name: string | null;
            image: string | null;
        };
        _count?: {
            conversations: number;
        };
    };
    isOwner?: boolean;
}

export function ProjectCard({ project, isOwner = false }: ProjectCardProps) {
    // Generate a random-ish gradient based on project ID for the preview background
    const getGradient = (id: string) => {
        const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colors = [
            "from-indigo-500/5 to-purple-500/5",
            "from-emerald-500/5 to-teal-500/5",
            "from-orange-500/5 to-red-500/5",
            "from-blue-500/5 to-cyan-500/5",
            "from-pink-500/5 to-rose-500/5",
        ];
        return colors[hash % colors.length];
    };

    return (
        <Link href={`/projects/${project.id}`}>
            <div className="group relative bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-black/20 h-full flex flex-col cursor-pointer">
                <div className="h-40 w-full bg-grid relative flex items-center justify-center overflow-hidden bg-black/20 shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-tr ${getGradient(project.id)}`}></div>
                    <div className="w-3/4 h-3/4 bg-zinc-950 border border-white/5 rounded-lg shadow-lg flex flex-col p-2 group-hover:scale-[1.02] transition-transform duration-500">
                        <div className="flex gap-1 mb-2">
                            <div className="size-2 rounded-full bg-red-500/20"></div>
                            <div className="size-2 rounded-full bg-yellow-500/20"></div>
                            <div className="size-2 rounded-full bg-green-500/20"></div>
                        </div>
                        <div className="flex-1 w-full bg-zinc-900/50 rounded"></div>
                        <div className="mt-2 h-2 w-1/2 bg-zinc-800 rounded"></div>
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-zinc-200 truncate pr-2">{project.title}</h3>
                        <div className="text-zinc-600 group-hover:text-white transition-colors">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>

                    <div className="flex-1"></div>

                    {!isOwner && (
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                            <div className="flex items-center gap-2">
                                {project.user?.image ? (
                                    <Image
                                        src={project.user.image}
                                        alt={project.user.name || "User"}
                                        width={20}
                                        height={20}
                                        className="rounded-full bg-zinc-800"
                                    />
                                ) : (
                                    <div className="size-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                                        {project.user?.name?.charAt(0) || "U"}
                                    </div>
                                )}
                                <span className="text-[10px] text-zinc-400 truncate max-w-[80px]">
                                    {project.user?.name || "Anonymous"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
