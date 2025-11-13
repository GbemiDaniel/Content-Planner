import React, { useState, useCallback } from 'react';
import { BrainCircuit, X, Wand2, Sparkles, Lightbulb } from 'lucide-react';
import GlassCard from '../Common/GlassCard';
import { brainstormIdeas } from '../../api';
import { useAppContext } from '../../contexts';
import { highlightHashtagsAndMentionsInJSX } from '../../utils';

const Brainstormer: React.FC = () => {
    const { handleUseIdea, setView } = useAppContext();
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [ideas, setIdeas] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async (generationTopic?: string) => {
        setIsGenerating(true);
        setError(null);
        setIdeas(null);
        try {
            const result = await brainstormIdeas(generationTopic);
            setIdeas(result);
        } catch (e: any) {
            setError(`AI brainstorming failed: ${e.message}`);
        } finally {
            setIsGenerating(false);
        }
    }, []);
    
    const handleClose = () => {
        setView('dashboard');
        setError(null);
        setIdeas(null);
    }

    return (
        <GlassCard className="p-6 space-y-6 w-full animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="text-purple-400" /> AI Idea Generator</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Feeling stuck? Let's brainstorm some ideas.</p>
                </div>
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic, e.g., 'sustainable energy'" className="flex-grow p-3 bg-gray-200/50 dark:bg-gray-800/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow" onKeyDown={(e) => e.key === 'Enter' && handleGenerate(topic)} />
                    <button onClick={() => handleGenerate(topic)} disabled={isGenerating || !topic.trim()} className="px-4 py-2.5 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Wand2 size={18} /> Generate</button>
                </div>
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm"> or </div>
                <button onClick={() => handleGenerate()} disabled={isGenerating} className="w-full px-4 py-2.5 bg-cyan-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Sparkles size={18} /> Suggest Trending Topics</button>
            </div>
             {error && (
                <div className="p-3 my-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex justify-between items-center">
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button>
                </div>
            )}
            <div className="space-y-4">
                {isGenerating && Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg bg-black/10 dark:bg-white/5 space-y-2">
                       <div className="relative w-full h-4 bg-gray-500/20 rounded-full overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent w-1/2 h-full animate-shimmer"></div></div>
                       <div className="relative w-3/4 h-4 bg-gray-500/20 rounded-full overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent w-1/2 h-full animate-shimmer"></div></div>
                    </div>
                ))}
                {ideas && ideas.map((idea, index) => (
                    <div key={index} className="p-4 rounded-lg bg-black/10 dark:bg-white/5 transition-all hover:bg-black/20 dark:hover:bg-white/10">
                        <p className="whitespace-pre-wrap mb-3 text-gray-800 dark:text-gray-200">{highlightHashtagsAndMentionsInJSX(idea)}</p>
                        <div className="text-right">
                           <button onClick={() => handleUseIdea(idea)} className="px-4 py-1 bg-green-500/80 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center gap-2 ml-auto"><Lightbulb size={16} /> Use This Idea</button>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

export default Brainstormer;