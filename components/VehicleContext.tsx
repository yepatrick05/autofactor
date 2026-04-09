"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type VehicleContextType = {
    activeVehicle: any | null;
    setActiveVehicle: (vehicle: any) => void;
    isContextLoading: boolean;
};

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
    const [activeVehicle, setActiveVehicleState] = useState<any | null>(null);
    const [isContextLoading, setIsContextLoading] = useState(true);

    useEffect(() => {
        const storedVehicle = localStorage.getItem("autofactor_active_vehicle");
        if (storedVehicle) {
            try {
                setActiveVehicleState(JSON.parse(storedVehicle));
            } catch (error) {
                console.error("Failed to parse stored vehicle", error);
            }
        }
        setIsContextLoading(false);
    }, []);

    const handleSetActiveVehicle = (vehicle: any) => {
        setActiveVehicleState(vehicle);
        if (vehicle) {
            localStorage.setItem("autofactor_active_vehicle", JSON.stringify(vehicle));
        } else {
            localStorage.removeItem("autofactor_active_vehicle");
        }
    };

    return (
        <VehicleContext.Provider
            value={{
                activeVehicle,
                setActiveVehicle: handleSetActiveVehicle,
                isContextLoading,
            }}
        >
            {children}
        </VehicleContext.Provider>
    );
}

export function useVehicle() {
    const context = useContext(VehicleContext);
    if (!context) throw new Error("useVehicle must be used within VehicleProvider");
    return context;
}
