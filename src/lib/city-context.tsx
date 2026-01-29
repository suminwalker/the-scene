"use client";

import React, { createContext, useContext, useState } from "react";

export type City = string;

interface CityContextType {
    city: City;
    setCity: (city: City) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
    // Default to NYC
    const [city, setCity] = useState<City>("nyc");

    return (
        <CityContext.Provider value={{ city, setCity }}>
            {children}
        </CityContext.Provider>
    );
}

export function useCity() {
    const context = useContext(CityContext);
    if (context === undefined) {
        throw new Error("useCity must be used within a CityProvider");
    }
    return context;
}

// CITIES will be derived dynamically from valid places
export const CITIES: Record<string, string> = {};
