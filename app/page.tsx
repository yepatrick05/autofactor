"use client";
import { useState } from "react";
import Link from "next/link";

const features = [
    {
        title: "Your Digital Garage",
        description:
            "Ditch the physical logbook. Store your vehicles, chassis numbers, and factory specs in one secure place.",
        imagePlaceholder: "🚗",
        color: "bg-blue-500",
    },
    {
        title: "The Modification Timeline",
        description:
            "Track every part, every drop of oil, and every bloody knuckle. Upload receipts and photos for a complete history.",
        imagePlaceholder: "🛠️",
        color: "bg-zinc-800",
    },
    {
        title: "Expense Tracking",
        description:
            "Know exactly where your money went. See cost breakdowns between maintenance and modifications at a glance.",
        imagePlaceholder: "📈",
        color: "bg-red-500",
    },
];

export default function LandingPage() {
    const [activeSlide, setActiveSlide] = useState(0);
    const isLastSlide = activeSlide === features.length - 1;

    const handleNext = () => {
        if (!isLastSlide) {
            setActiveSlide((prev) => prev + 1);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-2xl mb-12">
                <h1 className="text-5xl font-extrabold tracking-tight mb-2">AutoFactor</h1>
                <p className="text-xl text-zinc-400">The digital logbook for enthusiasts.</p>
            </div>

            <div className="w-full max-w-md bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col">
                <div className="p-8 h-80 flex flex-col items-center justify-center text-center">
                    <div
                        className={`w-24 h-24 ${features[activeSlide].color} rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg`}
                    >
                        {features[activeSlide].imagePlaceholder}
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{features[activeSlide].title}</h2>
                    <p className="text-zinc-400 leading-relaxed">{features[activeSlide].description}</p>
                </div>

                {/* Indicators */}
                <div className="flex justify-center gap-2 mb-6">
                    {features.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all ${
                                index === activeSlide ? "bg-white w-8" : "bg-zinc-700 w-2"
                            }`}
                        />
                    ))}
                </div>

                {/* Bottom Navigation Bar */}
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
                    {/* Back button (invisible on first slide to maintain flex spacing) */}
                    <button
                        onClick={() => setActiveSlide((prev) => prev - 1)}
                        disabled={activeSlide === 0}
                        className={`font-semibold px-4 py-2 text-zinc-400 hover:text-white transition-colors ${activeSlide === 0 ? "opacity-0 cursor-default" : "opacity-100"}`}
                    >
                        Back
                    </button>

                    {/* Conditional Next / Enter Garage Button */}
                    {isLastSlide ? (
                        <Link
                            href="/garage"
                            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors"
                        >
                            Enter Garage
                        </Link>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="bg-zinc-800 text-white px-6 py-2 rounded-full font-bold hover:bg-zinc-700 transition-colors"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
