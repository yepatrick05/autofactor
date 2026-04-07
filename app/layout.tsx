import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav"; // IMPORT YOUR NEW COMPONENT

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AutoFactor",
    description: "The digital logbook for enthusiasts.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
                suppressHydrationWarning
            >
                {/* We wrap children in a div with bottom padding so the Nav Bar doesn't cover your content! */}
                <div className="pb-24">{children}</div>

                {/* Inject the Global Navigation Shell */}
                <BottomNav />
            </body>
        </html>
    );
}
