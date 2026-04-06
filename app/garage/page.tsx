"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const DUMMY_USER_ID = "03256a10-6bc1-4c80-b9ee-7c5bfe073b23";

export default function GaragePage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [odometer, setOdometer] = useState("");

    console.log("My Supabase URL is:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const { data, error } = await supabase
                .from("vehicles")
                .select("*")
                .eq("user_id", DUMMY_USER_ID)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setVehicles(data || []);
        } catch (error: any) {
            console.error("Error fetching vehicles:", error.message || JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from("vehicles").insert([
                {
                    user_id: DUMMY_USER_ID,
                    make,
                    model,
                    year: parseInt(year),
                    odometer_reading: parseInt(odometer),
                },
            ]);

            if (error) throw error;

            setMake("");
            setModel("");
            setYear("");
            setOdometer("");
            setIsAdding(false);

            await fetchVehicles();
        } catch (error) {
            console.error("Error adding vehicle:", error);
            alert("Failed to add vehicle. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-12 mt-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">My Garage</h1>
                    <p className="text-zinc-400 mt-1">Select a vehicle to view its logbook.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors"
                    >
                        + Add Car
                    </button>
                )}
            </header>

            {loading && <p className="text-zinc-500 animate-pulse">Loading garage...</p>}

            {isAdding && (
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-4">Park a new car</h2>
                    <form onSubmit={handleAddVehicle} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Make (e.g. Nissan)"
                                required
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500"
                                value={make}
                                onChange={(e) => setMake(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Model (e.g. Skyline)"
                                required
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Year (e.g. 1999)"
                                required
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Odometer (km)"
                                required
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500"
                                value={odometer}
                                onChange={(e) => setOdometer(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-6 py-2 text-zinc-400 hover:text-white font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-white text-black px-8 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors"
                            >
                                Save Vehicle
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!loading && !isAdding && vehicles.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
                    <p className="text-zinc-500 mb-4">Your garage is empty.</p>
                    <button onClick={() => setIsAdding(true)} className="text-white font-semibold hover:underline">
                        Add your first vehicle
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((car) => (
                    <div
                        key={car.id}
                        className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">
                                    {car.year} {car.make}
                                </h3>
                                <p className="text-xl text-zinc-300">{car.model}</p>
                            </div>
                            <span className="bg-zinc-950 text-zinc-400 px-3 py-1 rounded-full text-sm font-mono border border-zinc-800">
                                {car.odometer_reading.toLocaleString()} km
                            </span>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <span className="text-zinc-500 text-sm group-hover:text-white transition-colors">
                                View Logbook →
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
