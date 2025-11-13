import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { AppProvider, useAppContext } from './contexts';
import { Dashboard } from './components/Dashboard';

const Header: React.FC = () => {
    const { isDarkMode, toggleTheme } = useAppContext();

    return (
        <header className="p-4 flex justify-between items-center fixed top-0 left-0 right-0 bg-white/30 dark:bg-black/30 backdrop-blur-lg border-b border-white/20 dark:border-white/10 z-10">
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
                X Content Planner
            </h1>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label="Toggle theme"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
};


const AppContent: React.FC = () => {
    return (
        <div className="min-h-screen font-sans text-gray-800 bg-gray-200 dark:text-gray-200 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 dark:from-gray-800 dark:via-purple-900/40 dark:to-gray-900 -z-10"></div>
            <Header />
            <main className="pt-20 p-4 md:p-8">
                <Dashboard />
            </main>
        </div>
    );
}

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
