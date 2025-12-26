"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface HeroProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading?: boolean;
}

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function Hero({ prompt, setPrompt, onSubmit, loading }: HeroProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [prompt]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e as unknown as React.FormEvent);
        }
    };
    const [isFocused, setIsFocused] = useState(false);

    return (
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] w-full px-4 overflow-hidden pt-20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-screen" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-center gap-2 mb-8 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md hover:bg-white/10 transition-colors"
            >
                <Sparkles className="size-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-100">AI-Powered Website Builder</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold text-center mb-6 tracking-tight max-w-5xl leading-[1.1]"
            >
                Build <span className="text-white">something</span> <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-[length:200%_auto] animate-shimmer">extraordinary</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-12 leading-relaxed"
            >
                Create stunning websites in seconds by simply chatting with Bloom.
                Transform your ideas into reality with the power of modern AI.
            </motion.p>

            {/* Input Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-full max-w-2xl px-4"
            >
                <div
                    className={`
                relative flex items-center bg-[#18181b]/80 border transition-all duration-300 rounded-2xl p-2 shadow-2xl
                ${isFocused ? "border-indigo-500/50 shadow-indigo-500/20 ring-1 ring-indigo-500/20" : "border-white/10 group hover:border-white/20"}
                backdrop-blur-xl
            `}
                >
                    <form className="flex-1 flex items-end gap-2" onSubmit={onSubmit}>
                        <textarea
                            ref={textareaRef}
                            className="flex-1 bg-transparent text-white placeholder-muted-foreground outline-none text-lg px-4 py-3 min-h-[3rem] max-h-[200px] resize-none overflow-y-auto"
                            placeholder="Describe your dream website..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            rows={1}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className={`
                    h-12 w-12 rounded-xl transition-all duration-300 shadow-none mb-1
                    ${prompt ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-muted-foreground cursor-not-allowed"}
                `}
                            disabled={!prompt || loading}
                        >
                            {loading ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <ArrowRight className="size-5" />
                            )}
                        </Button>
                    </form>
                </div>

                {/* Suggested Prompts */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    {["Portfolio for design agency", "SaaS landing page", "E-commerce dashboard"].map((p, i) => (
                        <button
                            key={i}
                            className="text-sm text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-full transition-colors cursor-pointer"
                            onClick={() => setPrompt(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
