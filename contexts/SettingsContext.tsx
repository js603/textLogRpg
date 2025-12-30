import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameSettings, NarrativeStyle } from '../types';

interface SettingsContextType {
    settings: GameSettings;
    updateSettings: (newSettings: Partial<GameSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: { narrativeStyle: 'classic', showTimestamp: true, autoScroll: true },
    updateSettings: () => { }
});

export function useSettings() {
    return useContext(SettingsContext);
}

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [settings, setSettings] = useState<GameSettings>(() => {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return { narrativeStyle: 'classic', showTimestamp: true, autoScroll: true };
            }
        }
        return { narrativeStyle: 'classic', showTimestamp: true, autoScroll: true };
    });

    const updateSettings = (newSettings: Partial<GameSettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('gameSettings', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}
