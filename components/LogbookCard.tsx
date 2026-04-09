"use client";
import Link from "next/link";
import { Box } from "lucide-react";

type Props = {
    item: any;
    isModList: boolean;
    categories: any[];
};

export default function LogbookCard({ item, isModList, categories }: Props) {
    const itemTitle = isModList ? item.name : item.title;
    const itemDate = new Date(isModList ? item.installed_date : item.date_logged).toLocaleDateString();
    const itemImg = isModList ? item.image_url : item.receipt_url;
    const catObj = categories.find((c) => c.id === item.category);

    return (
        <Link
            href={`/logbook/${item.id}?type=${isModList ? "mod" : "maintenance"}`}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex gap-4 items-center transition-all duration-300 cursor-pointer active:scale-[0.98] p-4"
        >
            <div className="bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative w-14 h-14">
                {itemImg ? (
                    <img src={itemImg} alt={itemTitle} className="w-full h-full object-cover" />
                ) : (
                    catObj?.icon || <Box className="text-zinc-600" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="min-w-0">
                        <h3 className="font-bold truncate pr-2 text-base text-white">{itemTitle}</h3>

                        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
                            {catObj?.label}
                            {item.location || item.provider ? ` • ${item.location || item.provider}` : ""}
                        </p>
                    </div>

                    <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-1">
                        <div className="text-zinc-400 text-xs font-medium">{itemDate}</div>
                        <div className="font-mono font-bold text-sm text-white">${item.cost}</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
