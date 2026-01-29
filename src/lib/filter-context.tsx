"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FilterState {
    crowd: string[];
    vibe: string[];
    intent: string[];
    age: string[];
}

interface FilterContextType {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<FilterState>({
        crowd: [],
        vibe: [],
        intent: [],
        age: []
    });

    return (
        <FilterContext.Provider value={{ filters, setFilters }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error("useFilter must be used within a FilterProvider");
    }
    return context;
}
