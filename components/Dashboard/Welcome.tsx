import React from 'react';
import { Plus, BrainCircuit, FileSearch } from 'lucide-react';
import { useAppContext } from '../../contexts';
import GlassCard from '../Common/GlassCard';

const Welcome: React.FC = () => {
    const { handleNewPost, setView } = useAppContext();

    return (
        <GlassCard className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-2">Welcome to your workspace</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Start by creating a post or brainstorming new ideas.</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={handleNewPost}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                    >
                        <Plus size={20} /> Create New Post
                    </button>
                    <button
                        onClick={() => setView('brainstorm')}
                        className="px-6 py-3 bg-transparent border-2 border-purple-400 text-purple-400 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-purple-400/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                    >
                        <BrainCircuit size={20} /> Brainstorm Ideas
                    </button>
                    <button
                        onClick={() => setView('analyzer')}
                        className="px-6 py-3 bg-transparent border-2 border-green-400 text-green-400 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-green-400/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                    >
                        <FileSearch size={20} /> Learn from a Post
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};

export default React.memo(Welcome);