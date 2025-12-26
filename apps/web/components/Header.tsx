"use client";

import { signIn, useSession } from "../lib/auth-client";
import Image from "next/image";
import { Button } from "./ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
    const { data: session } = useSession();
    const [authPopup, setAuthPopup] = useState(false);

    const handleLogIn = async () => {
        try {
            await signIn.social({ provider: "google" });
            setAuthPopup(false);
        } catch (e) {
            console.error("Login failed", e);
        }
    };

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20"
            >
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">B</div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Bloom</span>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                {session.user?.name}
                            </span>
                            <div className="relative size-9 rounded-full ring-2 ring-white/10 overflow-hidden hover:ring-primary/50 transition-all cursor-pointer">
                                {session.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="Avatar"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="size-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                                        {session.user?.name?.charAt(0) || "U"}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setAuthPopup(true)} className="text-muted-foreground hover:text-white hidden sm:flex">Log In</Button>
                            <Button onClick={() => setAuthPopup(true)} className="bg-white text-black hover:bg-gray-200 border-none shadow-lg shadow-white/5 font-semibold rounded-full px-6">Get Started</Button>
                        </>
                    )}
                </div>
            </motion.header>

            <AnimatePresence>
                {authPopup && !session && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setAuthPopup(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                            <div className="text-center mb-8 mt-2">
                                <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4 shadow-lg shadow-indigo-500/20">B</div>
                                <h2 className="text-2xl font-bold mb-2 text-white">Welcome to Bloom</h2>
                                <p className="text-muted-foreground text-sm">Sign in to start building amazing websites with AI.</p>
                            </div>

                            <Button onClick={handleLogIn} className="w-full bg-white text-black hover:bg-gray-200 h-11" size="lg">
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Continue with Google
                            </Button>

                            <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-white" onClick={() => setAuthPopup(false)}>
                                Cancel
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
