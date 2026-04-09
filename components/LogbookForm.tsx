"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useVehicle } from "@/components/VehicleContext";

type LogbookFormProps = {
    type: "mod" | "maintenance";
    category: string;
    isFuture: boolean;
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
};

export default function LogbookForm({ type, category, isFuture, initialData, onSuccess, onCancel }: LogbookFormProps) {
    const { activeVehicle } = useVehicle();
    const isMod = type === "mod";

    const [title, setTitle] = useState(initialData ? (isMod ? initialData.name : initialData.title) : "");
    const [cost, setCost] = useState(initialData?.cost?.toString() || "");
    const [provider, setProvider] = useState(initialData ? (isMod ? initialData.location : initialData.provider) : "");
    const [date, setDate] = useState(
        // if initial data exists, then we are in edit mode
        initialData
            ? isMod
                ? initialData.installed_date
                : initialData.date_logged
            : new Date().toISOString().split("T")[0],
    );
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [odometer, setOdometer] = useState(initialData?.odometer_reading?.toString() || "");
    const [volume, setVolume] = useState(initialData?.volume?.toString() || "");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSave = async () => {
        setIsUploading(true);
        try {
            let fileUrl = initialData ? (isMod ? initialData.image_url : initialData.receipt_url) : null;

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
                category,
                cost: cost ? parseFloat(cost) : 0,
                location: provider,
                installed_date: date,
                notes,
                is_wishlist: isFuture,
                image_url: fileUrl,
            };

            const maintPayload = {
                vehicle_id: activeVehicle.id,
                title: category === "fuel" ? "Fuel" : title,
                category,
                cost: cost ? parseFloat(cost) : 0,
                provider,
                date_logged: date,
                odometer_reading: odometer ? parseInt(odometer) : null,
                volume: volume ? parseFloat(volume) : null,
                notes,
                is_upcoming: isFuture,
                receipt_url: fileUrl,
            };

            const table = isMod ? "modifications" : "maintenance";
            const payload = isMod ? modPayload : maintPayload;

            if (initialData?.id) {
                const { error } = await supabase.from(table).update(payload).eq("id", initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from(table).insert([payload]);
                if (error) throw error;
            }

            onSuccess();
        } catch (error: any) {
            console.error("Save Error:", error);
            alert("Failed to save. Check console.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 w-full">
            {category === "fuel" ? (
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
                    onClick={onCancel}
                    className="flex-1 py-4 text-zinc-400 font-bold bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={(category !== "fuel" && !title) || isUploading}
                    className="flex-2 w-2/3 bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-blue-500 transition-colors"
                >
                    {isUploading ? "Saving..." : initialData ? "Save Changes" : "Save Entry"}
                </button>
            </div>
        </div>
    );
}
