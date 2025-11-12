import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Plus, Trash2, Edit, BrainCircuit, X, Sparkles, Wand2, Lightbulb, CheckCircle, FileSearch } from 'lucide-react';
import type { Post, Status, Tone, PostScore } from './types';
import { STATUSES, TONES, READINESS_CONFIG } from './constants';
import { checkReadiness, suggestHashtags, brainstormIdeas as brainstormIdeasService, analyzePostFromText, scorePost } from './services/geminiService';
import ContentCreator from './components/ContentCreator';
import PostPreview from './components/PostPreview';
import ContentList from './components/ContentList';
import GlassCard from './components/GlassCard';
import PostAnalyzer from './components/PostAnalyzer';

// --- Interfaces ---
interface SuccessNotification {
  id: number;
  message: string;
}

// --- Brainstormer Component ---
interface BrainstormerProps {
    onGenerate: (topic?: string) => void;
    isGenerating: boolean;
    ideas: string[] | null;
    onUseIdea: (idea: string) => void;
    onClose: () => void;
    error: string | null;
    setError: (error: string | null) => void;
}

const highlightHashtagsAndMentionsInJSX = (text: string) => {
    const parts = text.split(/([#@]\w+)/g);
    return parts.map((part, i) => {
        if (part.match(/([#@]\w+)/)) {
            return <span key={i} className="text-blue-400">{part}</span>;
        }
        return part;
    });
};

const Brainstormer: React.FC<BrainstormerProps> = ({
    onGenerate,
    isGenerating,
    ideas,
    onUseIdea,
    onClose,
    error,
    setError
}) => {
    const [topic, setTopic] = useState('');

    const handleGenerate = () => {
        if (topic.trim()) {
            onGenerate(topic);
        }
    };
    
    const handleGenerateTrending = () => {
        onGenerate();
    };

    return (
        <GlassCard className="p-6 space-y-6 w-full animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BrainCircuit className="text-purple-400" />
                        AI Idea Generator
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Feeling stuck? Let's brainstorm some ideas.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic, e.g., 'sustainable energy'"
                        className="flex-grow p-3 bg-gray-200/50 dark:bg-gray-800/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic.trim()}
                        className="px-4 py-2.5 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Wand2 size={18} /> Generate
                    </button>
                </div>
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm"> or </div>
                <button
                    onClick={handleGenerateTrending}
                    disabled={isGenerating}
                    className="w-full px-4 py-2.5 bg-cyan-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Sparkles size={18} /> Suggest Trending Topics
                </button>
            </div>
            
             {error && (
                <div className="p-3 my-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex justify-between items-center">
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-white/10">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {isGenerating && (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-lg bg-black/10 dark:bg-white/5 space-y-2">
                           <div className="relative w-full h-4 bg-gray-500/20 rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent w-1/2 h-full animate-shimmer"></div>
                            </div>
                           <div className="relative w-3/4 h-4 bg-gray-500/20 rounded-full overflow-hidden">
                               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent w-1/2 h-full animate-shimmer"></div>
                           </div>
                        </div>
                    ))
                )}
                {ideas && ideas.map((idea, index) => (
                    <div key={index} className="p-4 rounded-lg bg-black/10 dark:bg-white/5 transition-all hover:bg-black/20 dark:hover:bg-white/10">
                        <p className="whitespace-pre-wrap mb-3 text-gray-800 dark:text-gray-200">
                           {highlightHashtagsAndMentionsInJSX(idea)}
                        </p>
                        <div className="text-right">
                           <button onClick={() => onUseIdea(idea)} className="px-4 py-1 bg-green-500/80 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center gap-2 ml-auto">
                                <Lightbulb size={16} /> Use This Idea
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};


// --- Main App Component ---
const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPost, setCurrentPost] = useState<Post | null>(null);
    const [filter, setFilter] = useState<Status | 'All'>('All');
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isCheckingReadiness, setIsCheckingReadiness] = useState(false);
    const [hashtagSuggestions, setHashtagSuggestions] = useState<string | null>(null);
    const [isSuggestingHashtags, setIsSuggestingHashtags] = useState(false);
    const [postScore, setPostScore] = useState<PostScore | null>(null);
    const [isScoringPost, setIsScoringPost] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isBrainstorming, setIsBrainstorming] = useState(false);
    const [brainstormedIdeas, setBrainstormedIdeas] = useState<string[] | null>(null);
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [successNotification, setSuccessNotification] = useState<SuccessNotification | null>(null);
    const [isAnalyzingPost, setIsAnalyzingPost] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    useEffect(() => {
        try {
            const savedPosts = localStorage.getItem('x-content-planner-posts');
            if (savedPosts) {
                setPosts(JSON.parse(savedPosts));
            }
        } catch (e) {
            console.error("Failed to load posts from local storage", e);
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };
    
    const persistPosts = (newPosts: Post[]) => {
        setPosts(newPosts);
        localStorage.setItem('x-content-planner-posts', JSON.stringify(newPosts));
    };
    
    const showSuccessNotification = (message: string) => {
        const id = Date.now();
        setSuccessNotification({ id, message });
        setTimeout(() => {
            setSuccessNotification(current => (current?.id === id ? null : current));
        }, 3000);
    };

    const clearAiStates = () => {
        setAiFeedback(null);
        setHashtagSuggestions(null);
        setPostScore(null);
        setError(null);
    };

    const handleNewPost = () => {
        setCurrentPost({
            id: `new-${Date.now()}`,
            content: [{ text: '', image: null }],
            status: 'Idea',
            tones: [],
            createdAt: new Date().toISOString(),
            scheduledAt: null,
        });
        clearAiStates();
    };

    const handleSavePost = (postToSave: Post) => {
        const existingIndex = posts.findIndex(p => p.id === postToSave.id);
        let newPosts;
        if (existingIndex > -1) {
            newPosts = [...posts];
            newPosts[existingIndex] = { ...postToSave, id: postToSave.id.startsWith('new-') ? Date.now().toString() : postToSave.id };
        } else {
            newPosts = [{ ...postToSave, id: Date.now().toString() }, ...posts];
        }
        persistPosts(newPosts);
        setCurrentPost(null);
        clearAiStates();
    };

    const handleEditPost = (id: string) => {
        const postToEdit = posts.find(p => p.id === id);
        if (postToEdit) {
            setCurrentPost(postToEdit);
            clearAiStates();
        }
    };

    const handleDeletePost = (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const newPosts = posts.filter(p => p.id !== id);
            persistPosts(newPosts);
            if (currentPost?.id === id) {
                setCurrentPost(null);
            }
        }
    };

    const handleCheckReadiness = useCallback(async () => {
        if (!currentPost || currentPost.content.every(c => c.text.trim() === '')) {
            setError("Cannot check readiness of an empty post.");
            return;
        }
        setIsCheckingReadiness(true);
        setError(null);
        setAiFeedback(null);
        try {
            const feedback = await checkReadiness(currentPost.content.map(c => c.text), currentPost.tones);
            setAiFeedback(feedback);
        } catch (e: any) {
            setError(`AI analysis failed: ${e.message}`);
            console.error(e);
        } finally {
            setIsCheckingReadiness(false);
        }
    }, [currentPost]);

    const handleSuggestHashtags = useCallback(async () => {
        if (!currentPost || currentPost.content.every(c => c.text.trim() === '')) {
            setError("Cannot suggest hashtags for an empty post.");
            return;
        }
        setIsSuggestingHashtags(true);
        setError(null);
        setHashtagSuggestions(null);
        try {
            const suggestions = await suggestHashtags(currentPost.content.map(c => c.text));
            setHashtagSuggestions(suggestions);
        } catch (e: any) {
            setError(`AI hashtag suggestion failed: ${e.message}`);
            console.error(e);
        } finally {
            setIsSuggestingHashtags(false);
        }
    }, [currentPost]);
    
    const handleScorePost = useCallback(async () => {
        if (!currentPost || currentPost.content.every(c => c.text.trim() === '')) {
            setError("Cannot score an empty post.");
            return;
        }
        setIsScoringPost(true);
        setError(null);
        setPostScore(null);
        try {
            const scoreData = await scorePost(currentPost.content.map(c => c.text), currentPost.tones);
            setPostScore(scoreData);
        } catch (e: any) {
            setError(`AI scoring failed: ${e.message}`);
            console.error(e);
        } finally {
            setIsScoringPost(false);
        }
    }, [currentPost]);

    const handleBrainstorm = useCallback(async (topic?: string) => {
        setIsGeneratingIdeas(true);
        setError(null);
        setBrainstormedIdeas(null);
        try {
            const ideas = await brainstormIdeasService(topic);
            setBrainstormedIdeas(ideas);
        } catch (e: any) {
            setError(`AI brainstorming failed: ${e.message}`);
            console.error(e);
        } finally {
            setIsGeneratingIdeas(false);
        }
    }, []);

    const handleUseIdea = (ideaText: string) => {
        setCurrentPost({
            id: `new-${Date.now()}`,
            content: [{ text: ideaText, image: null }],
            status: 'Idea',
            tones: [],
            createdAt: new Date().toISOString(),
            scheduledAt: null,
        });
        clearAiStates();
        setIsBrainstorming(false);
        setBrainstormedIdeas(null);
    };

    const handleAnalyzePostText = useCallback(async (text: string) => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzePostFromText(text);
            setAnalysisResult(result);
        } catch (e: any) {
            setError(`AI analysis failed: ${e.message}`);
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.status === filter);

    return (
        <div className="min-h-screen font-sans text-gray-800 bg-gray-200 dark:text-gray-200 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 dark:from-gray-800 dark:via-purple-900/40 dark:to-gray-900 -z-10"></div>

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

            <main className="pt-20 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-7 space-y-8">
                    {currentPost ? (
                        <ContentCreator 
                            post={currentPost} 
                            setPost={setCurrentPost} 
                            onSave={handleSavePost}
                            onCancel={() => { setCurrentPost(null); clearAiStates(); }}
                            onCheckReadiness={handleCheckReadiness}
                            isCheckingReadiness={isCheckingReadiness}
                            aiFeedback={aiFeedback}
                            error={error}
                            setError={setError}
                            clearAiFeedback={() => setAiFeedback(null)}
                            onSuggestHashtags={handleSuggestHashtags}
                            isSuggestingHashtags={isSuggestingHashtags}
                            hashtagSuggestions={hashtagSuggestions}
                            clearHashtagSuggestions={() => setHashtagSuggestions(null)}
                            showSuccessNotification={showSuccessNotification}
                            onScorePost={handleScorePost}
                            isScoringPost={isScoringPost}
                            postScore={postScore}
                            clearPostScore={() => setPostScore(null)}
                        />
                    ) : isBrainstorming ? (
                        <Brainstormer 
                            onGenerate={handleBrainstorm}
                            isGenerating={isGeneratingIdeas}
                            ideas={brainstormedIdeas}
                            onUseIdea={handleUseIdea}
                            onClose={() => {
                                setIsBrainstorming(false);
                                setBrainstormedIdeas(null);
                                setError(null);
                            }}
                            error={error}
                            setError={setError}
                        />
                    ) : isAnalyzingPost ? (
                        <PostAnalyzer 
                            onAnalyze={handleAnalyzePostText}
                            isAnalyzing={isAnalyzing}
                            analysisResult={analysisResult}
                            onClose={() => {
                                setIsAnalyzingPost(false);
                                setAnalysisResult(null);
                                setError(null);
                            }}
                            error={error}
                            setError={setError}
                            clearAnalysis={() => setAnalysisResult(null)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
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
                                        onClick={() => setIsBrainstorming(true)}
                                        className="px-6 py-3 bg-transparent border-2 border-purple-400 text-purple-400 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-purple-400/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <BrainCircuit size={20} /> Brainstorm Ideas
                                    </button>
                                     <button
                                        onClick={() => setIsAnalyzingPost(true)}
                                        className="px-6 py-3 bg-transparent border-2 border-green-400 text-green-400 font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-green-400/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <FileSearch size={20} /> Learn from a Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="xl:col-span-5 space-y-8">
                    {currentPost && <PostPreview post={currentPost} />}
                    <ContentList 
                        posts={filteredPosts} 
                        onEdit={handleEditPost} 
                        onDelete={handleDeletePost} 
                        filter={filter} 
                        setFilter={setFilter} 
                        currentPostId={currentPost?.id}
                    />
                </div>
            </main>
            
            {successNotification && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-in-bottom w-max max-w-[90vw]">
                    <GlassCard className="!p-0">
                        <div className="flex items-center gap-3 pl-4 pr-2 py-3 bg-green-500/20 text-green-300">
                            <CheckCircle size={20} />
                            <p className="font-medium text-sm">{successNotification.message}</p>
                            <button onClick={() => setSuccessNotification(null)} className="p-1 rounded-full hover:bg-white/10 ml-2">
                                <X size={16} />
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default App;