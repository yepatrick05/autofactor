// components/VehicleContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type VehicleContextType = {
    activeVehicle: any | null;
    setActiveVehicle: (vehicle: any) => void;
};

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
    const [activeVehicle, setActiveVehicle] = useState<any | null>(null);

    return <VehicleContext.Provider value={{ activeVehicle, setActiveVehicle }}>{children}</VehicleContext.Provider>;
}

export function useVehicle() {
    const context = useContext(VehicleContext);
    if (!context) throw new Error("useVehicle must be used within VehicleProvider");
    return context;
}
