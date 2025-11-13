import { useEffect, useCallback } from 'react';
import { usePersistentState } from './usePersistentState';

/**
 * Manages the application's theme (dark/light mode) and persists it to localStorage.
 */
export function useTheme() {
    const [isDarkMode, setIsDarkMode] = usePersistentState<boolean>('theme:dark', 
        () => window.matchMedia('(prefers-color-scheme: dark)').matches
    );

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
