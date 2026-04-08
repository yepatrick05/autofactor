"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Settings,
    Droplets,
    CircleStop,
    Disc,
    Cog,
    ChevronsDown,
    Armchair,
    PaintBucket,
    Cpu,
    Wrench,
} from "lucide-react";

import { useVehicle } from "@/components/VehicleContext";

const DUMMY_USER_ID = "03256a10-6bc1-4c80-b9ee-7c5bfe073b23";

// The Categories matching our Postgres Enums
const CATEGORIES = [
    { id: "engine", label: "Engine", icon: <Settings size={24} /> },
    { id: "exhaust", label: "Exhaust", icon: <Droplets size={24} /> },
    { id: "brake", label: "Brakes", icon: <CircleStop size={24} /> },
    { id: "wheel_tyre", label: "Wheels/Tyres", icon: <Disc size={24} /> },
    { id: "drivetrain", label: "Drivetrain", icon: <Cog size={24} /> },
    { id: "suspension", label: "Suspension", icon: <ChevronsDown size={24} /> },
    { id: "interior", label: "Interior", icon: <Armchair size={24} /> },
    { id: "exterior", label: "Exterior", icon: <PaintBucket size={24} /> },
    { id: "electronics", label: "Electronics", icon: <Cpu size={24} /> },
    { id: "other", label: "Other", icon: <Wrench size={24} /> },
];

function ModsContent() {
    const { activeVehicle } = useVehicle(); // Get the globally selected car

    const router = useRouter();
    const searchParams = useSearchParams();
    const isAddingNew = searchParams.get("new") === "true";

    const [mods, setMods] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"installed" | "wishlist">("installed");

    // Wizard State
    const [addStep, setAddStep] = useState(1); // 1 = Grid, 2 = Form
    const [selectedCategory, setSelectedCategory] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [source, setSource] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!activeVehicle?.id) return;

        const fetchMods = async () => {
            const { data, error } = await supabase
                .from("modifications")
                .select("*")
                .eq("vehicle_id", activeVehicle.id)
                .eq("is_wishlist", activeTab === "wishlist")
                .order("installed_date", { ascending: false });

            if (!error && data) setMods(data);
        };

        fetchMods();
    }, [activeVehicle?.id, activeTab, isAddingNew]);

    if (!activeVehicle) {
        return (
            <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center pb-24">
                <Wrench size={48} className="text-zinc-800 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Vehicle Selected</h2>
                <p className="text-zinc-500 mb-8">You need to park a car in your garage before you can modify it.</p>
                <button
                    onClick={() => router.push("/garage")}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors"
                >
                    Go to Garage
                </button>
            </main>
        );
    }

    const handleCloseWizard = () => {
        setAddStep(1);
        setSelectedCategory("");
        setName("");
        setCost("");
        setSource("");
        setNotes("");
        router.push("/mods");
    };

    const handleSaveMod = async () => {
        setIsUploading(true);
        try {
            let imageUrl = null;

            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage.from("mod-images").upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const {
                    data: { publicUrl },
                } = supabase.storage.from("mod-images").getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            const { error: dbError } = await supabase.from("modifications").insert([
                {
                    vehicle_id: activeVehicle.id,
                    name,
                    category: selectedCategory,
                    cost: cost ? parseFloat(cost) : 0,
                    location: source,
                    notes,
                    is_wishlist: activeTab === "wishlist",
                    image_url: imageUrl,
                },
            ]);

            if (dbError) throw dbError;

            setImageFile(null);
            handleCloseWizard();
        } catch (error: any) {
            console.error("Error saving mod", error.message || JSON.stringify(error, null, 2));
            alert("Failed to save mod. Check console.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isAddingNew) {
        return (
            <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto animate-in slide-in-from-bottom-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">{addStep === 1 ? "Select Category" : "Mod Details"}</h1>
                    <button onClick={handleCloseWizard} className="text-zinc-500 font-semibold">
                        Cancel
                    </button>
                </header>

                {addStep === 1 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setAddStep(2);
                                }}
                                className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors"
                            >
                                <div className="text-zinc-400">{cat.icon}</div>
                                <span className="font-semibold text-sm">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3 mb-2">
                            {CATEGORIES.find((c) => c.id === selectedCategory)?.icon}
                            <span className="font-bold text-blue-400">
                                {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                            </span>
                        </div>

                        <input
                            type="text"
                            placeholder="Mod Name (e.g. TE37 Saga)"
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Cost ($)"
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Vendor / Source (Optional)"
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                        />
                        <textarea
                            placeholder="Notes (Specs, thoughts, install notes...)"
                            rows={3}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500 resize-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider mb-2 block">
                                Attach Receipt or Photo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                            />
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setAddStep(1)}
                                className="flex-1 py-4 text-zinc-400 font-bold bg-zinc-900 rounded-xl"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSaveMod}
                                disabled={!name}
                                className="flex-2 w-2/3 bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                            >
                                Save to {activeTab === "wishlist" ? "Wishlist" : "Timeline"}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
            {/* Header & Vehicle Selector */}
            <header className="mb-6 mt-4">
                {activeVehicle ? (
                    <h1 className="text-3xl font-extrabold tracking-tight mb-4">
                        {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                    </h1>
                ) : (
                    <h1 className="text-3xl font-extrabold text-zinc-500 mb-4">Select a vehicle in Garage</h1>
                )}

                {/* The Segmented Control */}
                <div className="bg-zinc-900 p-1 rounded-xl flex">
                    <button
                        onClick={() => setActiveTab("installed")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "installed" ? "bg-zinc-700 text-white shadow-md" : "text-zinc-500"}`}
                    >
                        Installed
                    </button>
                    <button
                        onClick={() => setActiveTab("wishlist")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "wishlist" ? "bg-blue-600 text-white shadow-md" : "text-zinc-500"}`}
                    >
                        Wishlist
                    </button>
                </div>
            </header>

            {/* The Timeline Feed */}
            <div className="flex flex-col gap-4 pb-12">
                {mods.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                        <p className="text-zinc-500 mb-2">No mods in this list yet.</p>
                        <p className="text-sm text-zinc-600">Hit the + button to add one.</p>
                    </div>
                ) : (
                    mods.map((mod) => (
                        <div
                            key={mod.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-4 items-center"
                        >
                            <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                                {mod.image_url ? (
                                    <img src={mod.image_url} alt={mod.name} className="w-full h-full object-cover" />
                                ) : (
                                    CATEGORIES.find((c) => c.id === mod.category)?.icon || (
                                        <Wrench className="text-zinc-600" />
                                    )
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{mod.name}</h3>
                                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                                    {CATEGORIES.find((c) => c.id === mod.category)?.label}
                                </p>
                                <div className="flex justify-between items-center text-sm text-zinc-400">
                                    <span>{new Date(mod.installed_date).toLocaleDateString()}</span>
                                    <span className="font-mono">${mod.cost}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

export default function ModsPage() {
    return (
        <Suspense fallback={<div className="bg-black min-h-screen"></div>}>
            <ModsContent />
        </Suspense>
    );
}
