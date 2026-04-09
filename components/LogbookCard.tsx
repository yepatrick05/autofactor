"use client";
import Link from "next/link";
import { Box } from "lucide-react";

type Props = {
    item: any;
    isModList: boolean;
    categories: any[];
    size?: "default" | "compact";
};

export default function LogbookCard({ item, isModList, categories, size = "default" }: Props) {
    const itemTitle = isModList ? item.name : item.title;
    const itemDate = new Date(isModList ? item.installed_date : item.date_logged).toLocaleDateString();

    const itemImg = isModList ? item.image_url : item.receipt_url;

    const catObj = categories.find((c) => c.id === item.category);

    const isCompact = size === "compact";

    return (
        <Link
            href={`/logbook/${item.id}?type=${isModList ? "mod" : "maintenance"}`}
            className={`bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex gap-4 items-center transition-all duration-300 cursor-pointer active:scale-[0.98]
        ${isCompact ? "p-3" : "p-4"}`}
        >
            {/* IMAGE */}
            <div
                className={`bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative
        ${isCompact ? "w-12 h-12" : "w-16 h-16"}`}
            >
                {itemImg ? (
                    <img src={itemImg} alt={itemTitle} className="w-full h-full object-cover" />
                ) : (
                    catObj?.icon || <Box className="text-zinc-600" />
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    {/* LEFT */}
                    <div className="min-w-0">
                        <h3 className={`font-bold truncate pr-2 ${isCompact ? "text-base" : "text-lg"}`}>
                            {itemTitle}
                        </h3>

                        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                            {catObj?.label}
                            {item.location || item.provider ? ` • ${item.location || item.provider}` : ""}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right shrink-0 ml-4">
                        <div className={`text-zinc-400 ${isCompact ? "text-xs" : "text-sm"}`}>{itemDate}</div>
                        <div className={`font-mono font-bold ${isCompact ? "text-sm text-blue-400" : "text-white"}`}>
                            ${item.cost}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
