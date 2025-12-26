import { signIn, useSession, signOut } from "../lib/auth-client";
import Image from "next/image";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Flower2 } from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
    authPopup: boolean;
    setAuthPopup: (value: boolean) => void;
}

export function Header({ authPopup, setAuthPopup }: HeaderProps) {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogIn = async () => {
        try {
            await signIn.social({ provider: "google" });
            setAuthPopup(false);
        } catch (e) {
            console.error("Login failed", e);
            toast.error("Login failed. Please try again.");
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 w-full h-14 flex items-center justify-between px-6 border-b border-white/5 bg-background/50 backdrop-blur-md">
                <div className="flex items-center gap-8">
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="size-5 bg-white rounded-full flex items-center justify-center text-black">
                            <Flower2 size={12} />
                        </div>
                        <span className="text-sm font-medium tracking-tight text-white group-hover:text-zinc-200 transition-colors">Bloom</span>
                    </a>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <div className="h-5 w-px bg-white/10"></div>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    className="flex items-center gap-2 group cursor-pointer"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <div className="size-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10 flex items-center justify-center overflow-hidden">
                                        {session.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                width={24}
                                                height={24}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-[9px] font-medium text-white">
                                                {session.user?.name?.charAt(0) || "U"}
                                            </span>
                                        )}
                                    </div>
                                    <span className="hidden sm:block text-xs text-secondary group-hover:text-white transition-colors">
                                        {session.user?.name}
                                    </span>
                                    <ChevronDown size={12} className="text-secondary group-hover:text-white transition-colors" />
                                </button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute top-8 right-0 z-50 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1"
                                        >
                                            <div className="px-4 py-2 border-b border-white/5 mb-1">
                                                <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                                            </div>

                                            <button
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                                                onClick={async () => {
                                                    setDropdownOpen(false);
                                                    await signOut();
                                                    toast.success("Signed out successfully");
                                                    router.push("/");
                                                }}
                                            >
                                                Log Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setAuthPopup(true)} className="text-sm font-medium text-secondary hover:text-white transition-colors cursor-pointer">
                                Log In
                            </button>
                            <button onClick={() => setAuthPopup(true)} className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors cursor-pointer">
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </nav>

            <AnimatePresence>
                {authPopup && !session && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setAuthPopup(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-sm"
                            onClick={e => e.stopPropagation()}
                        >


                            <div className="relative bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">


                                <div className="text-center mb-8 mt-2">
                                    <div className="size-16 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-white/5 ring-4 ring-white/10 transition-all duration-500">
                                        <Flower2 size={32} className="text-black" />
                                    </div>
                                    <h2 className="text-2xl font-semibold mb-2 text-white tracking-tight">Welcome to Bloom</h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        Join our community of creators building the next generation of the web.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        onClick={handleLogIn}
                                        className="w-full bg-white text-black hover:bg-zinc-200 h-11 transition-all duration-300 shadow-lg shadow-white/5"
                                        size="lg"
                                    >
                                        <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Continue with Google
                                    </Button>

                                    <button
                                        className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2 cursor-pointer"
                                        onClick={() => setAuthPopup(false)}
                                    >
                                        Maybe later
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 text-center px-2">
                                    <p className="text-[10px] text-zinc-500">
                                        By continuing, you agree to Bloom's Terms of Service and Privacy Policy.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
