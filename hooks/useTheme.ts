import { useState, useEffect, useCallback } from 'react';
import { usePersistentState } from './usePersistentState';

/**
 * Manages the application's theme (dark/light mode) and persists it to localStorage.
 */
export function useTheme() {
    const [isDarkMode, setIsDarkMode] = usePersistentState<boolean>('theme:dark', false);

    useEffect(() => {
        // Check for saved theme or system preference on initial load
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDarkMode(true);
        } else {
            setIsDarkMode(false);
        }
    }, [setIsDarkMode]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, [setIsDarkMode]);

    return { isDarkMode, toggleTheme };
}
