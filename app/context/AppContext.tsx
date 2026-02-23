"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
    activeNavIndex: number;
    setActiveNavIndex: (index: number) => void;
    showBottomNav: boolean;
    setShowBottomNav: (show: boolean) => void;
    currentModal: string | null;
    openModal: (modalName: string) => void;
    closeModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [darkMode, setDarkMode] = useState(false);
    const [activeNavIndex, setActiveNavIndex] = useState(0);
    const [showBottomNav, setShowBottomNav] = useState(true);
    const [currentModal, setCurrentModal] = useState<string | null>(null);

    useEffect(() => {
        const savedDark = localStorage.getItem("darkMode");
        if (savedDark === "true") {
            setDarkMode(true);
            document.body.classList.add("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) document.body.classList.add("dark");
        else document.body.classList.remove("dark");
        localStorage.setItem("darkMode", newMode.toString());
    };

    const openModal = (modalName: string) => {
        setCurrentModal(modalName);
        setShowBottomNav(false);
    };

    const closeModal = () => {
        setCurrentModal(null);
        setShowBottomNav(true);
    };

    return (
        <AppContext.Provider
            value={{
                darkMode,
                toggleDarkMode,
                activeNavIndex,
                setActiveNavIndex,
                showBottomNav,
                setShowBottomNav,
                currentModal,
                openModal,
                closeModal
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
