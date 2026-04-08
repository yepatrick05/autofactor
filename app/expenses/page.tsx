"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useVehicle } from "@/components/VehicleContext";
import { useRouter } from "next/navigation";
import { Receipt, TrendingUp, Car, Wrench, AlertTriangle } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
    engine: "Engine",
    exhaust: "Exhaust",
    brake: "Brakes",
    wheel_tyre: "Wheels/Tyres",
    drivetrain: "Drivetrain",
    suspension: "Suspension",
    interior: "Interior",
    exterior: "Exterior",
    electronics: "Electronics",
    other: "Other",
};

// wraps the entire page in a function
export default function ExpensesPage() {
    const router = useRouter();
    const { activeVehicle } = useVehicle();

    const [mods, setMods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // useeffect - something should happen when we perform the following below
    useEffect(() => {
        // if theres no vehicle, then we shouldnt need to render anything. this is already dealt with the null page (assuming no car is selected, later down below)
        if (!activeVehicle?.id) return;

        const fetchExpenses = async () => {
            // because we are wrapped in an async, keep a loading page for theuser/ some sort of visual information that lets them know its loading
            setLoading(true);

            // await to retrieve info from database
            const { data, error } = await supabase
                .from("modifications")
                .select("id, name, cost, category, installed_date")
                .eq("vehicle_id", activeVehicle.id)
                .eq("is_wishlist", false)
                .gt("cost", 0)
                .order("cost", { ascending: false });

            if (!error && data) setMods(data);
            // remove the set loading after await is done
            setLoading(false);
        };
        // actually perform the function
        fetchExpenses();

        // this effect runs whenever active vehicle changes. the logic is - we obviosuly display a different expenses list depending on the vehicle serlected
    }, [activeVehicle?.id]);
}
