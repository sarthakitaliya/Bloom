import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface HeroProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
}

export function Hero({ prompt, setPrompt, onSubmit, loading }: HeroProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [prompt]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 flex flex-col items-center gap-8">

            <div className="text-center space-y-2">
                <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-400">
                    What will you create?
                </h1>
                <p className="text-secondary font-light text-sm">
                    Describe your vision. Bloom handles the code.
                </p>
            </div>

            <div className="w-full max-w-2xl relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
                <div className="relative w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5 group-focus-within:ring-white/10 transition-all">
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="sm:text-lg placeholder-zinc-500 min-h-[7rem] resize-none focus:outline-none leading-relaxed text-base font-light text-white bg-transparent w-full pt-4 pr-5 pb-4 pl-5"
                        placeholder="Build a dashboard for a finance app with charts..."
                        disabled={loading}
                    />
                    <div className="px-3 pb-3 pt-2 flex items-center justify-end border-t border-white/5">

                        <button
                            onClick={onSubmit}
                            disabled={!prompt || loading}
                            className={`group/btn flex items-center gap-2 bg-white text-black px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] ${!prompt || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-200 cursor-pointer'}`}
                        >
                            <span>{loading ? "Generating..." : "Generate"}</span>
                            {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <ArrowRight className="size-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 opacity-70">
                {[
                    { label: "Landing Page", prompt: "Build a modern landing page for a tech startup with a hero section, feature highlights, testimonials, and a call-to-action" },
                    { label: "E-commerce", prompt: "Create an e-commerce product page with image gallery, size selector, add to cart button, and customer reviews section" },
                    { label: "SaaS Dashboard", prompt: "Design a SaaS analytics dashboard with charts, stats cards, recent activity feed, and a sidebar navigation" },
                    { label: "Portfolio", prompt: "Build a creative portfolio website for a designer with project showcases, about section, skills, and contact form" },
                    { label: "Blog", prompt: "Create a minimalist blog homepage with featured articles, category filters, newsletter signup, and dark mode support" },
                ].map((chip) => (
                    <button
                        key={chip.label}
                        onClick={() => setPrompt(chip.prompt)}
                        className="px-2.5 py-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                        {chip.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
