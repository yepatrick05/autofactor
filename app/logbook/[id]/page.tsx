"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Trash2, Edit3, Calendar, DollarSign, MapPin, Gauge, FileText } from "lucide-react";

function EntryDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const id = params.id as string;
    const type = searchParams.get("type"); // 'mod' or 'maintenance'

    const [entry, setEntry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 1. Fetch the exact entry
    useEffect(() => {
        if (!id || !type) return;

        const fetchEntry = async () => {
            const table = type === "mod" ? "modifications" : "maintenance";
            const { data, error } = await supabase.from(table).select("*").eq("id", id).single();

            if (!error && data) setEntry(data);
            setLoading(false);
        };

        fetchEntry();
    }, [id, type]);

    // 2. The Delete Function
    const handleDelete = async () => {
        setIsDeleting(true);
        const table = type === "mod" ? "modifications" : "maintenance";

        // First, delete the image from storage if it exists (Good practice to save AWS costs!)
        const imageUrl = type === "mod" ? entry.image_url : entry.receipt_url;
        if (imageUrl) {
            const fileName = imageUrl.split("/").pop();
            if (fileName) await supabase.storage.from("mod-images").remove([fileName]);
        }

        // Then delete the row from Postgres
        const { error } = await supabase.from(table).delete().eq("id", id);

        if (!error) {
            router.push("/logbook"); // Kick them back to the logbook
        } else {
            alert("Failed to delete entry.");
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
                Loading details...
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <p>Entry not found.</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-400">
                    Go Back
                </button>
            </div>
        );
    }

    // Normalize data depending on table type
    const isMod = type === "mod";
    const title = isMod ? entry.name : entry.title;
    const date = new Date(isMod ? entry.installed_date : entry.date_logged).toLocaleDateString();
    const image = isMod ? entry.image_url : entry.receipt_url;
    const location = isMod ? entry.location : entry.provider;

    return (
        <main className="min-h-screen bg-black text-white pb-24 animate-in fade-in">
            {/* HEADER: Back Button & Actions */}
            <header className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent pt-6 pb-4 px-6 flex justify-between items-center max-w-md mx-auto">
                <button
                    onClick={() => router.back()}
                    className="bg-zinc-900/80 backdrop-blur p-2 rounded-full hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => alert("Edit mode coming soon!")}
                        className="bg-zinc-900/80 backdrop-blur p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-300"
                    >
                        <Edit3 size={20} />
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-900/20 backdrop-blur p-2 rounded-full hover:bg-red-900/40 transition-colors text-red-500"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </header>

            {/* HERO IMAGE OR GRADIENT */}
            <div className="w-full max-w-md mx-auto h-72 bg-zinc-900 relative sm:rounded-b-3xl overflow-hidden">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                        <span className="text-zinc-700 text-6xl">No Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* CONTENT */}
            <div className="max-w-md mx-auto px-6 -mt-12 relative z-10">
                <div className="mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                        {entry.category}
                    </span>
                    {(entry.is_wishlist || entry.is_upcoming) && (
                        <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                            Planned
                        </span>
                    )}
                </div>

                <h1 className="text-4xl font-black tracking-tight mb-6">{title}</h1>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                        <DollarSign size={20} className="text-blue-400 mb-2" />
                        <p className="text-zinc-500 text-xs font-bold uppercase">Cost</p>
                        <p className="text-xl font-bold">${entry.cost}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                        <Calendar size={20} className="text-blue-400 mb-2" />
                        <p className="text-zinc-500 text-xs font-bold uppercase">Date</p>
                        <p className="text-lg font-bold">{date}</p>
                    </div>
                    {location && (
                        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 col-span-2 flex items-center gap-4">
                            <MapPin size={24} className="text-zinc-500" />
                            <div>
                                <p className="text-zinc-500 text-xs font-bold uppercase">Vendor / Shop</p>
                                <p className="font-bold">{location}</p>
                            </div>
                        </div>
                    )}
                    {entry.odometer_reading && (
                        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 col-span-2 flex items-center gap-4">
                            <Gauge size={24} className="text-zinc-500" />
                            <div>
                                <p className="text-zinc-500 text-xs font-bold uppercase">Odometer</p>
                                <p className="font-bold">{entry.odometer_reading.toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </div>

                {entry.notes && (
                    <div className="mb-8">
                        <h3 className="text-sm text-zinc-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FileText size={16} /> Notes
                        </h3>
                        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* THE DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Trash2 className="text-red-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2">Delete Entry?</h3>
                        <p className="text-zinc-400 text-center text-sm mb-6">
                            Are you sure you want to delete <span className="text-white font-bold">{title}</span>? This
                            action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 py-3 text-zinc-300 font-bold bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

// Wrap in Suspense due to useSearchParams
export default function EntryDetailPage() {
    return (
        <Suspense fallback={<div className="bg-black min-h-screen"></div>}>
            <EntryDetailContent />
        </Suspense>
    );
}
