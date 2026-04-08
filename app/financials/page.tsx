"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useVehicle } from "@/components/VehicleContext";
import { useRouter } from "next/navigation";
import { Receipt, TrendingUp, Car, Wrench, AlertTriangle } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
    engine: "Engine",
    exhaust: "Exhaust",
    brake: "Brakes",
    wheel_tyre: "Wheels/Tyres",
    drivetrain: "Drivetrain",
    suspension: "Suspension",
    interior: "Interior",
    exterior: "Exterior",
    electronics: "Electronics",
    other: "Other",
};

// wraps the entire page in a function
export default function ExpensesPage() {
    const router = useRouter();
    const { activeVehicle } = useVehicle();

    const [mods, setMods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // useeffect - something should happen when we perform the following below
    useEffect(() => {
        // if theres no vehicle, then we shouldnt need to render anything. this is already dealt with the null page (assuming no car is selected, later down below)
        if (!activeVehicle?.id) return;

        const fetchExpenses = async () => {
            // because we are wrapped in an async, keep a loading page for theuser/ some sort of visual information that lets them know its loading
            setLoading(true);

            // await to retrieve info from database
            const { data, error } = await supabase
                .from("modifications")
                .select("id, name, cost, category, installed_date")
                .eq("vehicle_id", activeVehicle.id)
                .eq("is_wishlist", false)
                .gt("cost", 0)
                .order("cost", { ascending: false });

            if (!error && data) setMods(data);
            // remove the set loading after await is done
            setLoading(false);
        };
        // actually perform the function
        fetchExpenses();

        // this effect runs whenever active vehicle changes. the logic is - we obviosuly display a different expenses list depending on the vehicle serlected
    }, [activeVehicle?.id]);

    if (!activeVehicle) {
        return (
            <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center pb-24">
                <Receipt size={48} className="text-zinc-800 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Vehicle Selected</h2>
                <p className="text-zinc-500 mb-8">Park a car in your garage to view its financial damage.</p>
                <button
                    onClick={() => router.push("/garage")}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors"
                >
                    Go to Garage
                </button>
            </main>
        );
    }

    const baseCost = activeVehicle.purchase_cost || 0;
    const totalModsCost = mods.reduce((sum, mod) => sum + (mod.cost || 0), 0);
    const grandTotal = baseCost + totalModsCost;

    const categoryTotals = mods.reduce(
        (acc, mod) => {
            acc[mod.category] = (acc[mod.category] || 0) + mod.cost;
            return acc;
        },
        {} as Record<string, number>,
    );

    const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => (b as number) - (a as number));

    return (
        <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto pb-24">
            <header className="mb-8 mt-4">
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">Financials</h1>
                <p className="text-zinc-400 font-medium">
                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                </p>
            </header>

            {/* 1. The Grand Total Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl mb-6 shadow-2xl relative overflow-hidden">
                {/* Decorative background icon */}
                <TrendingUp className="absolute -right-6 -bottom-6 text-zinc-800/50" size={120} strokeWidth={1} />

                <div className="relative z-10">
                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Total Investment</p>
                    <h2 className="text-5xl font-black tracking-tighter text-white mb-6">
                        ${grandTotal.toLocaleString()}
                    </h2>

                    <div className="flex gap-4">
                        <div className="flex-1 bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                            <Car className="text-blue-400 mb-2" size={20} />
                            <p className="text-zinc-500 text-xs font-bold uppercase">Vehicle Base</p>
                            <p className="text-lg font-bold">${baseCost.toLocaleString()}</p>
                        </div>
                        <div className="flex-1 bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                            <Wrench className="text-blue-400 mb-2" size={20} />
                            <p className="text-zinc-500 text-xs font-bold uppercase">Modifications</p>
                            <p className="text-lg font-bold">${totalModsCost.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. The Cost Breakdown (Tailwind Progress Bars) */}
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Receipt size={20} className="text-blue-500" /> Cost Breakdown
            </h3>

            {mods.length === 0 ? (
                <div className="text-center py-10 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                    <p className="text-zinc-500 text-sm">No expenses logged yet.</p>
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-5">
                    {sortedCategories.map(([category, cost]) => {
                        // Calculate percentage for the visual bar
                        const percentage = Math.round(((cost as number) / totalModsCost) * 100);

                        return (
                            <div key={category} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="font-semibold text-zinc-300">
                                        {CATEGORY_LABELS[category] || "Other"}
                                    </span>
                                    <div className="text-right">
                                        <span className="font-bold text-white mr-2">
                                            ${(cost as number).toLocaleString()}
                                        </span>
                                        <span className="text-xs text-zinc-500 font-mono">{percentage}%</span>
                                    </div>
                                </div>
                                {/* Visual Bar */}
                                <div className="w-full bg-black rounded-full h-2.5 overflow-hidden border border-zinc-800">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
