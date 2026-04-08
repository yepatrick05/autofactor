"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, PieChart, Calendar, Plus, Wrench, Receipt } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

    if (pathname === "/") return null;

    const handleFabClick = () => {
        setIsFabMenuOpen(!isFabMenuOpen);
    };

    return (
        <>
            {/* THE CONTEXTUAL MENU OVERLAY */}
            {isFabMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-end justify-center pb-32 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-11/12 max-w-sm shadow-2xl animate-in slide-in-from-bottom-10">
                        <h3 className="text-white font-bold mb-4 text-center">
                            {pathname === "/garage" ? "Garage Actions" : "Add to Logbook"}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {pathname === "/garage" ? (
                                // --- GARAGE FAB MENU ---
                                <Link
                                    href="/garage?new=true"
                                    onClick={() => setIsFabMenuOpen(false)}
                                    className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors col-span-2"
                                >
                                    <Home className="text-blue-400" size={24} />
                                    <span className="text-white font-medium text-sm">Add Vehicle</span>
                                </Link>
                            ) : (
                                // --- LOGBOOK FAB MENU (The Hybrid UI) ---
                                <>
                                    <Link
                                        href="/logbook?new=mod"
                                        onClick={() => setIsFabMenuOpen(false)}
                                        className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors"
                                    >
                                        <Wrench className="text-blue-400" size={24} />
                                        <span className="text-white font-medium text-sm">Add Mod</span>
                                    </Link>
                                    <Link
                                        href="/logbook?new=maintenance"
                                        onClick={() => setIsFabMenuOpen(false)}
                                        className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors"
                                    >
                                        <Receipt className="text-blue-400" size={24} />
                                        <span className="text-white font-medium text-sm">Add Expense</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* THE BOTTOM NAVIGATION BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 pb-safe">
                <div className="max-w-md mx-auto relative flex justify-between items-center px-6 py-3">
                    <Link
                        href="/garage"
                        className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes("/garage") ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        <Home size={24} strokeWidth={pathname.includes("/garage") ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Garage</span>
                    </Link>

                    {/* Renamed to Logbook */}
                    <Link
                        href="/logbook"
                        className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes("/logbook") ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        <BookOpen size={24} strokeWidth={pathname.includes("/logbook") ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Logbook</span>
                    </Link>

                    {/* Center FAB */}
                    <div className="relative -top-6">
                        <button
                            onClick={handleFabClick}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform duration-300 ${
                                isFabMenuOpen
                                    ? "bg-zinc-800 rotate-45 border border-zinc-700"
                                    : "bg-blue-600 hover:bg-blue-500"
                            }`}
                        >
                            <Plus className="text-white" size={32} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Renamed to Financials */}
                    <Link
                        href="/financials"
                        className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes("/financials") ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        <PieChart size={24} strokeWidth={pathname.includes("/financials") ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Financials</span>
                    </Link>

                    <Link
                        href="/events"
                        className={`flex flex-col items-center gap-1 transition-colors ${pathname.includes("/events") ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        <Calendar size={24} strokeWidth={pathname.includes("/events") ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Events</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
