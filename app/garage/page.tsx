"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const DUMMY_USER_ID = "03256a10-6bc1-4c80-b9ee-7c5bfe073b23";

export default function GaragePage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const [formStep, setFormStep] = useState(1);

    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [odometer, setOdometer] = useState("");

    const [purchaseCost, setPurchaseCost] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");

    const [fuelUnit, setFuelUnit] = useState("liters");
    const [odometerUnit, setOdometerUnit] = useState("km");

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
            console.error("Error fetching vehicles:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVehicle = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.from("vehicles").insert([
                {
                    user_id: DUMMY_USER_ID,
                    make,
                    model,
                    year: parseInt(year),
                    odometer_reading: parseInt(odometer),
                    purchase_cost: purchaseCost ? parseFloat(purchaseCost) : null,
                    purchase_date: purchaseDate ? purchaseDate : null,
                    fuel_unit: fuelUnit,
                    odometer_unit: odometerUnit,
                },
            ]);

            if (error) throw error;

            setIsAdding(false);
            setFormStep(1);
            setMake("");
            setModel("");
            setYear("");
            setOdometer("");
            setPurchaseCost("");
            setPurchaseDate("");
            setFuelUnit("liters");
            setOdometerUnit("km");

            await fetchVehicles();
        } catch (error: any) {
            console.error("Error adding vehicle:", error.message);
            alert("Failed to add vehicle. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                    placeholder="Odometer"
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
                    type="button"
                    onClick={() => setFormStep(2)}
                    disabled={!make || !model || !year || !odometer}
                    className="bg-white text-black px-8 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-zinc-950/50">
                <span className="text-4xl mb-3">📸</span>
                <h3 className="text-lg font-semibold mb-1">Add a Cover Photo</h3>
                <p className="text-zinc-500 text-sm mb-4">Show off the stance. (Optional)</p>

                <input
                    type="file"
                    accept="image/*"
                    className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                />
            </div>
            <div className="flex justify-between items-center mt-4">
                <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="px-6 py-2 text-zinc-400 hover:text-white font-semibold transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={() => setFormStep(3)}
                    className="bg-white text-black px-8 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors"
                >
                    Skip / Next
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider ml-1">
                        Purchase Cost
                    </label>
                    <input
                        type="number"
                        placeholder="$0.00 (Optional)"
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500"
                        value={purchaseCost}
                        onChange={(e) => setPurchaseCost(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider ml-1">
                        Purchase Date
                    </label>
                    <input
                        type="date"
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500 w-full"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider ml-1">Fuel Unit</label>
                    <select
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500"
                        value={fuelUnit}
                        onChange={(e) => setFuelUnit(e.target.value)}
                    >
                        <option value="liters">Liters</option>
                        <option value="gallons">Gallons</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider ml-1">
                        Distance Unit
                    </label>
                    <select
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500"
                        value={odometerUnit}
                        onChange={(e) => setOdometerUnit(e.target.value)}
                    >
                        <option value="km">Kilometers</option>
                        <option value="miles">Miles</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="px-6 py-2 text-zinc-400 hover:text-white font-semibold transition-colors"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSaveVehicle}
                    className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-500 transition-colors"
                >
                    Park Vehicle 🏁
                </button>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-12 mt-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">My Garage</h1>

                    {!isAdding && vehicles.length > 0 && (
                        <p className="text-zinc-400 mt-1">Select a vehicle to view its logbook.</p>
                    )}
                    {isAdding && <p className="text-blue-400 mt-1 font-medium">Step {formStep} of 3</p>}
                </div>
            </header>

            {isAdding && (
                <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 mb-8 shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                        <h2 className="text-2xl font-bold">
                            {formStep === 1 && "Vehicle Details"}
                            {formStep === 2 && "Cover Photo"}
                            {formStep === 3 && "Optional Details"}
                        </h2>

                        <div className="flex gap-2">
                            <div className={`h-2 w-8 rounded-full ${formStep >= 1 ? "bg-blue-500" : "bg-zinc-700"}`} />
                            <div
                                className={`h-2 w-8 rounded-full transition-colors duration-300 ${formStep >= 2 ? "bg-blue-500" : "bg-zinc-700"}`}
                            />
                            <div
                                className={`h-2 w-8 rounded-full transition-colors duration-300 ${formStep === 3 ? "bg-blue-500" : "bg-zinc-700"}`}
                            />
                        </div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()}>
                        {formStep === 1 && renderStep1()}
                        {formStep === 2 && renderStep2()}
                        {formStep === 3 && renderStep3()}
                    </form>
                </div>
            )}

            {!loading && !isAdding && vehicles.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
                    <p className="text-zinc-500 mb-4">Your garage is empty.</p>
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setFormStep(1);
                        }}
                        className="text-white font-semibold hover:underline"
                    >
                        Add your first vehicle
                    </button>
                </div>
            )}

            {!isAdding && (
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
                                    {car.odometer_reading.toLocaleString()} {car.odometer_unit}
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
            )}
        </main>
    );
}
