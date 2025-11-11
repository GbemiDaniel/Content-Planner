import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Plus, Trash2, List, Edit, BrainCircuit, X } from 'lucide-react';
import type { Post, Status, Tone } from './types';
import { STATUSES, TONES, READINESS_CONFIG } from './constants';
import { checkReadiness } from './services/geminiService';
import ContentCreator from './components/ContentCreator';
import PostPreview from './components/PostPreview';
import ContentList from './components/ContentList';

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPost, setCurrentPost] = useState<Post | null>(null);
    const [filter, setFilter] = useState<Status | 'All'>('All');
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isCheckingReadiness, setIsCheckingReadiness] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleNewPost = () => {
        setCurrentPost({
            id: `new-${Date.now()}`,
            content: [{ text: '', image: null }],
            status: 'Idea',
            tones: [],
            createdAt: new Date().toISOString(),
            scheduledAt: null,
        });
        setAiFeedback(null);
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
        setAiFeedback(null);
    };

    const handleEditPost = (id: string) => {
        const postToEdit = posts.find(p => p.id === id);
        if (postToEdit) {
            setCurrentPost(postToEdit);
            setAiFeedback(null);
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

            <main className="pt-20 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {currentPost ? (
                        <ContentCreator 
                            post={currentPost} 
                            setPost={setCurrentPost} 
                            onSave={handleSavePost}
                            onCancel={() => { setCurrentPost(null); setAiFeedback(null); }}
                            onCheckReadiness={handleCheckReadiness}
                            isCheckingReadiness={isCheckingReadiness}
                            aiFeedback={aiFeedback}
                            error={error}
                            setError={setError}
                            clearAiFeedback={() => setAiFeedback(null)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            <div className="text-center p-8">
                                <h2 className="text-2xl font-bold mb-2">Welcome to your workspace</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Start planning your next viral content.</p>
                                <button
                                    onClick={handleNewPost}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Plus size={20} /> Create New Post
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="lg:col-span-2 space-y-8">
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
        </div>
    );
};

export default App;
