"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useVehicle } from "@/components/VehicleContext";
import { useSearchParams, useRouter } from "next/navigation";
import LogbookCard from "@/components/LogbookCard";
import Link from "next/link";
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
    List,
    Fuel,
    Shield,
    FileText,
    ClipboardCheck,
    CreditCard,
    Activity,
    Box,
    BookOpen,
    ArrowLeft,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

const MOD_CATEGORIES = [
    { id: "engine", label: "Engine", icon: <Settings size={24} /> },
    { id: "exhaust", label: "Exhaust", icon: <Droplets size={24} /> },
    { id: "brake", label: "Brakes", icon: <CircleStop size={24} /> },
    { id: "wheel_tyre", label: "Wheels/Tyres", icon: <Disc size={24} /> },
    { id: "drivetrain", label: "Drivetrain", icon: <Cog size={24} /> },
    { id: "suspension", label: "Suspension", icon: <ChevronsDown size={24} /> },
    { id: "interior", label: "Interior", icon: <Armchair size={24} /> },
    { id: "exterior", label: "Exterior", icon: <PaintBucket size={24} /> },
    { id: "electronics", label: "Electronics", icon: <Cpu size={24} /> },
    { id: "other", label: "Other", icon: <Box size={24} /> },
];

const MAINT_CATEGORIES = [
    { id: "service", label: "Service", icon: <Wrench size={24} /> },
    { id: "repair", label: "Repair", icon: <Activity size={24} /> },
    { id: "fuel", label: "Fuel", icon: <Fuel size={24} /> },
    { id: "insurance", label: "Insurance", icon: <Shield size={24} /> },
    { id: "registration", label: "Registration", icon: <FileText size={24} /> },
    { id: "inspection", label: "Inspection", icon: <ClipboardCheck size={24} /> },
    { id: "membership", label: "Membership", icon: <CreditCard size={24} /> },
    { id: "other", label: "Other", icon: <Box size={24} /> },
];

function LogbookContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeVehicle, isContextLoading } = useVehicle();

    // --- VIEW STATE ---
    const [activeTab, setActiveTab] = useState<"mods" | "maintenance">("mods");
    const [feedFilter, setFeedFilter] = useState<"history" | "planned">("history");
    const [feedData, setFeedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Advanced View State ---
    const [isListView, setIsListView] = useState(false);
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    // --- Card State ---
    const [editId, setEditId] = useState<string | null>(null);

    // --- WIZARD STATE ---
    const [wizardType, setWizardType] = useState<"mod" | "maintenance" | null>(null);
    const [addStep, setAddStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isFuture, setIsFuture] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [cost, setCost] = useState("");
    const [provider, setProvider] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [notes, setNotes] = useState("");
    const [odometer, setOdometer] = useState("");
    const [volume, setVolume] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const newParam = searchParams.get("new");
        const editParam = searchParams.get("edit");
        const idParam = searchParams.get("id");
        const typeParam = searchParams.get("type");

        if (newParam === "mod") {
            setWizardType("mod");
            setAddStep(1);
            setIsFuture(false);
            setEditId(null);
        } else if (newParam === "maintenance") {
            setWizardType("maintenance");
            setAddStep(1);
            setIsFuture(false);
            setEditId(null);
        } else if (editParam === "true" && idParam && typeParam) {
            setEditId(idParam);
            setWizardType(typeParam as "mod" | "maintenance");

            const fetchEditData = async () => {
                const table = typeParam === "mod" ? "modifications" : "maintenance";
                const { data } = await supabase.from(table).select("*").eq("id", idParam).single();

                if (data) {
                    setSelectedCategory(data.category);
                    setTitle(typeParam === "mod" ? data.name : data.title);
                    setCost(data.cost.toString());
                    setProvider(typeParam === "mod" ? data.location : data.provider);
                    setDate(typeParam === "mod" ? data.installed_date : data.date_logged);
                    setNotes(data.notes || "");
                    setIsFuture(typeParam === "mod" ? data.is_wishlist : data.is_upcoming);

                    if (typeParam === "maintenance") {
                        setOdometer(data.odometer_reading?.toString() || "");
                        setVolume(data.volume?.toString() || "");
                    }

                    setAddStep(2);
                }
            };
            fetchEditData();
        }
    }, [searchParams]);
    useEffect(() => {
        if (!activeVehicle?.id) return;

        const fetchFeed = async () => {
            setLoading(true);
            const isPlanned = feedFilter === "planned";
            if (activeTab === "mods") {
                const { data } = await supabase
                    .from("modifications")
                    .select("*")
                    .eq("vehicle_id", activeVehicle.id)
                    .eq("is_wishlist", isPlanned)
                    .order("installed_date", { ascending: false });
                setFeedData(data || []);
            } else {
                const { data } = await supabase
                    .from("maintenance")
                    .select("*")
                    .eq("vehicle_id", activeVehicle.id)
                    .eq("is_upcoming", isPlanned)
                    .order("date_logged", { ascending: false });
                setFeedData(data || []);
            }
            setLoading(false);
        };
        fetchFeed();
    }, [activeVehicle?.id, activeTab, wizardType, feedFilter]);

    // --- THE SORTING ENGINE ---
    const sortedData = [...feedData].sort((a, b) => {
        const isModList = activeTab === "mods";

        // Sort by Date
        if (sortField === "date") {
            const dateA = new Date(isModList ? a.installed_date : a.date_logged).getTime();
            const dateB = new Date(isModList ? b.installed_date : b.date_logged).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        }
        // Sort by Cost
        if (sortField === "cost") {
            return sortOrder === "desc" ? b.cost - a.cost : a.cost - b.cost;
        }
        // Sort by Name
        if (sortField === "name") {
            const nameA = isModList ? a.name : a.title;
            const nameB = isModList ? b.name : b.title;
            // asc = A-Z, desc = Z-A
            return sortOrder === "desc" ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
        }
        return 0;
    });

    const handleCloseWizard = () => {
        setWizardType(null);
        setAddStep(1);
        setSelectedCategory("");
        setIsFuture(false);
        setTitle("");
        setCost("");
        setProvider("");
        setNotes("");
        setOdometer("");
        setVolume("");
        setFile(null);
        setEditId(null);
        router.push("/logbook");
    };

    const handleSave = async () => {
        setIsUploading(true);
        try {
            let fileUrl = null;
            if (file) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from("mod-images").upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data } = supabase.storage.from("mod-images").getPublicUrl(fileName);
                fileUrl = data.publicUrl;
            }

            const modPayload = {
                vehicle_id: activeVehicle.id,
                name: title,
                category: selectedCategory,
                cost: cost ? parseFloat(cost) : 0,
                location: provider,
                installed_date: date,
                notes,
                is_wishlist: isFuture,
                ...(fileUrl && { image_url: fileUrl }),
            };

            const maintPayload = {
                vehicle_id: activeVehicle.id,
                title: selectedCategory === "fuel" ? "Fuel" : title,
                category: selectedCategory,
                cost: cost ? parseFloat(cost) : 0,
                provider: provider,
                date_logged: date,
                odometer_reading: odometer ? parseInt(odometer) : null,
                volume: volume ? parseFloat(volume) : null,
                notes,
                is_upcoming: isFuture,
                ...(fileUrl && { receipt_url: fileUrl }),
            };

            if (wizardType === "mod") {
                if (editId) {
                    const { error } = await supabase.from("modifications").update(modPayload).eq("id", editId);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from("modifications").insert([modPayload]);
                    if (error) throw error;
                }
            } else {
                if (editId) {
                    const { error } = await supabase.from("maintenance").update(maintPayload).eq("id", editId);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from("maintenance").insert([maintPayload]);
                    if (error) throw error;
                }
            }
            handleCloseWizard();
        } catch (error: any) {
            console.error("Save Error:", error);
            alert("Failed to save entry. Check console.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isContextLoading) {
        return <main className="min-h-screen bg-black"></main>;
    }

    if (!activeVehicle) {
        return (
            <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center pb-24">
                <BookOpen size={48} className="text-zinc-800 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Vehicle Selected</h2>
                <p className="text-zinc-500 mb-8">Park a car in your garage to start logging history.</p>
                <button
                    onClick={() => router.push("/garage")}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors"
                >
                    Go to Garage
                </button>
            </main>
        );
    }

    // --- WIZARD UI ---
    if (wizardType) {
        const isMod = wizardType === "mod";
        const categories = isMod ? MOD_CATEGORIES : MAINT_CATEGORIES;

        return (
            <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto animate-in slide-in-from-bottom-8 pb-24">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold flex items-baseline gap-2">
                        {isMod ? "Modifications" : "Expenses"}
                        <span className={`text-lg font-medium ${isFuture ? "text-blue-400" : "text-zinc-500"}`}>
                            {isFuture ? (isMod ? "Wishlist" : "Upcoming") : isMod ? "Installed" : "Completed"}
                        </span>
                    </h1>
                    <button onClick={handleCloseWizard} className="text-zinc-500 font-semibold">
                        Cancel
                    </button>
                </header>

                {addStep === 1 ? (
                    <div className="flex flex-col gap-6">
                        <div className="bg-zinc-900 p-1 rounded-xl flex">
                            <button
                                onClick={() => setIsFuture(false)}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!isFuture ? "bg-blue-600 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                {isMod ? "Installed" : "Completed"}
                            </button>
                            <button
                                onClick={() => setIsFuture(true)}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${isFuture ? "bg-blue-600 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                {isMod ? "Wishlist" : "Upcoming"}
                            </button>
                        </div>
                        <h3 className="text-zinc-400 font-bold uppercase tracking-wider text-sm -mb-2">
                            Select Category
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {categories.map((cat) => (
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
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3 mb-2">
                            {categories.find((c) => c.id === selectedCategory)?.icon}
                            <span className="font-bold text-blue-400">
                                {categories.find((c) => c.id === selectedCategory)?.label}
                            </span>
                        </div>

                        {selectedCategory === "fuel" ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Total Cost ($)"
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder={`Volume (${activeVehicle.fuel_unit})`}
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                        value={volume}
                                        onChange={(e) => setVolume(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder={`Odometer (${activeVehicle.odometer_unit})`}
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                        value={odometer}
                                        onChange={(e) => setOdometer(e.target.value)}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Gas Station / Brand"
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                />
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Cost ($)"
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Vendor / Shop (Optional)"
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                />
                                {!isMod && (
                                    <input
                                        type="number"
                                        placeholder={`Odometer Reading (${activeVehicle.odometer_unit})`}
                                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-zinc-500"
                                        value={odometer}
                                        onChange={(e) => setOdometer(e.target.value)}
                                    />
                                )}
                            </>
                        )}

                        <textarea
                            placeholder="Notes (Specs, thoughts...)"
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
                                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
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
                                onClick={handleSave}
                                disabled={(selectedCategory !== "fuel" && !title) || isUploading}
                                className="flex-2 w-2/3 bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                            >
                                {isUploading ? "Saving..." : "Save Entry"}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        );
    }

    // --- THE ADVANCED LIST VIEW ---
    if (isListView) {
        return (
            <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto animate-in slide-in-from-right-8 duration-300 pb-24">
                {/* Full List Toolbar */}
                <header className="flex justify-between items-center mb-8 mt-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsListView(false)}
                            className="bg-zinc-900 hover:bg-zinc-800 p-2.5 rounded-full transition-colors border border-zinc-800"
                        >
                            <ArrowLeft size={20} className="text-zinc-400" />
                        </button>
                        <h2 className="text-xl font-bold tracking-tight">
                            {activeTab === "mods" ? "Modifications" : "Expenses"}
                        </h2>
                    </div>

                    {/* Sorting Controls */}
                    <div className="flex items-center gap-2">
                        {/* The Field Selector */}
                        <div className="relative">
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                                className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-semibold py-2.5 pl-4 pr-4 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer text-center"
                            >
                                <option value="date">Date</option>
                                <option value="cost">Price</option>
                                <option value="name">Name</option>
                            </select>
                        </div>

                        {/* The Direction Toggle Button */}
                        <button
                            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white focus:outline-none focus:border-blue-500"
                            title={sortOrder === "desc" ? "Descending" : "Ascending"}
                        >
                            {sortOrder === "desc" ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                        </button>
                    </div>
                </header>

                <div className="flex flex-col gap-3">
                    {sortedData.map((item) => {
                        const isModList = activeTab === "mods";

                        return (
                            <LogbookCard
                                key={item.id}
                                item={item}
                                isModList={isModList}
                                categories={isModList ? MOD_CATEGORIES : MAINT_CATEGORIES}
                                size="compact"
                            />
                        );
                    })}
                </div>
            </main>
        );
    }

    // --- DASHBOARD UI (Normal View) ---
    return (
        <main className="min-h-screen bg-black text-white p-6 max-w-md mx-auto">
            <header className="mb-6 mt-4">
                <h1 className="text-3xl font-extrabold tracking-tight mb-4">
                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                </h1>

                <div className="bg-zinc-900 p-1 rounded-xl flex">
                    <button
                        onClick={() => {
                            setActiveTab("mods");
                            setIsListView(false);
                            setFeedFilter("history");
                        }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "mods" ? "bg-blue-600 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Modifications
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("maintenance");
                            setIsListView(false);
                            setFeedFilter("history");
                        }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "maintenance" ? "bg-zinc-700 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Expenses
                    </button>
                </div>

                <div className="flex gap-6 mt-5 border-b border-zinc-800/50 px-2">
                    <button
                        onClick={() => {
                            setFeedFilter("history");
                            setIsListView(false);
                        }}
                        className={`text-sm font-bold pb-3 border-b-2 transition-all ${feedFilter === "history" ? "border-blue-500 text-white" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
                    >
                        {activeTab === "mods" ? "Installed" : "Completed"}
                    </button>
                    <button
                        onClick={() => {
                            setFeedFilter("planned");
                            setIsListView(false);
                        }}
                        className={`text-sm font-bold pb-3 border-b-2 transition-all ${feedFilter === "planned" ? "border-blue-500 text-white" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
                    >
                        {activeTab === "mods" ? "Wishlist" : "Upcoming"}
                    </button>
                </div>
            </header>

            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="text-center py-10">
                        <p className="text-zinc-500">Loading history...</p>
                    </div>
                ) : sortedData.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                        <p className="text-zinc-500 mb-2">No entries in this list.</p>
                        <p className="text-sm text-zinc-600">Hit the + button to add one.</p>
                    </div>
                ) : (
                    sortedData.slice(0, 3).map((item, index) => {
                        const isFaded = index === 2;
                        const isModList = activeTab === "mods";

                        return (
                            <div
                                key={item.id}
                                className={
                                    isFaded ? "opacity-70 transition-all duration-300" : "transition-all duration-300"
                                }
                                style={
                                    isFaded
                                        ? {
                                              maskImage: "linear-gradient(to bottom, black 20%, transparent 100%)",
                                              WebkitMaskImage:
                                                  "linear-gradient(to bottom, black 20%, transparent 100%)",
                                          }
                                        : {}
                                }
                            >
                                <LogbookCard
                                    item={item}
                                    isModList={isModList}
                                    categories={isModList ? MOD_CATEGORIES : MAINT_CATEGORIES}
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {sortedData.length > 2 && (
                <button
                    onClick={() => setIsListView(true)}
                    className="w-full bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 py-3 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white font-semibold transition-colors mt-2"
                >
                    <List size={18} /> View All {sortedData.length} Entries
                </button>
            )}

            {!isListView && (
                <div className="mt-8 mb-24 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-6 text-center animate-in fade-in duration-500 flex flex-col items-center justify-center">
                    <Activity className="text-zinc-700 mx-auto mb-3" size={32} />
                    <h3 className="text-zinc-300 font-bold mb-1">Analytics Sandbox</h3>
                    <p className="text-zinc-500 text-sm">
                        Future home of your sorting toggles, performance metrics, and dyno charts.
                    </p>
                </div>
            )}
        </main>
    );
}

export default function LogbookPage() {
    return (
        <Suspense
            fallback={
                <div className="bg-black min-h-screen flex items-center justify-center">
                    <p className="text-zinc-500">Loading...</p>
                </div>
            }
        >
            <LogbookContent />
        </Suspense>
    );
}
