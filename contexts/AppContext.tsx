import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Post } from '../types';
import { useTheme, usePosts } from '../hooks';

type View = 'dashboard' | 'editor' | 'brainstorm' | 'analyzer';

interface AppContextType {
    // Theme
    isDarkMode: boolean;
    toggleTheme: () => void;
    // Posts
    posts: Post[];
    addPost: (post: Post) => void;
    updatePost: (post: Post) => void;
    deletePost: (id: string) => void;
    filter: string;
    setFilter: (filter: any) => void;
    filteredPosts: Post[];
    // Current State
    currentPost: Post | null;
    setCurrentPost: React.Dispatch<React.SetStateAction<Post | null>>;
    view: View;
    setView: React.Dispatch<React.SetStateAction<View>>;
    // Handlers
    handleNewPost: () => void;
    handleEditPost: (id: string) => void;
    handleSavePost: (post: Post) => void;
    handleCancel: () => void;
    handleUseIdea: (idea: string) => void;
    showSuccessNotification: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface SuccessNotification {
  id: number;
  message: string;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { posts, addPost, updatePost, deletePost, filter, setFilter, filteredPosts } = usePosts();
    const [currentPost, setCurrentPost] = useState<Post | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [successNotification, setSuccessNotification] = useState<SuccessNotification | null>(null);


    const showSuccessNotification = useCallback((message: string) => {
        const id = Date.now();
        setSuccessNotification({ id, message });
        setTimeout(() => {
            setSuccessNotification(current => (current?.id === id ? null : current));
        }, 3000);
    }, []);

    const handleNewPost = useCallback(() => {
        setCurrentPost({
            id: `new-${Date.now()}`,
            content: [{ text: '', image: null }],
            status: 'Idea',
            tones: [],
            createdAt: new Date().toISOString(),
            scheduledAt: null,
        });
        setView('editor');
    }, []);

    const handleEditPost = useCallback((id: string) => {
        const postToEdit = posts.find(p => p.id === id);
        if (postToEdit) {
            setCurrentPost(postToEdit);
            setView('editor');
        }
    }, [posts]);

    const handleSavePost = useCallback((postToSave: Post) => {
        const existingIndex = posts.findIndex(p => p.id === postToSave.id);
        if (existingIndex > -1) {
            updatePost(postToSave);
        } else {
            addPost(postToSave);
        }
        setCurrentPost(null);
        setView('dashboard');
    }, [posts, addPost, updatePost]);
    
    const handleDeletePost = useCallback((id: string) => {
        deletePost(id);
        if (currentPost?.id === id) {
            setCurrentPost(null);
            setView('dashboard');
        }
    },[currentPost, deletePost]);

    const handleCancel = useCallback(() => {
        setCurrentPost(null);
        setView('dashboard');
    }, []);

    const handleUseIdea = useCallback((ideaText: string) => {
        setCurrentPost({
            id: `new-${Date.now()}`,
            content: [{ text: ideaText, image: null }],
            status: 'Idea',
            tones: [],
            createdAt: new Date().toISOString(),
            scheduledAt: null,
        });
        setView('editor');
    }, []);


    const value = useMemo(() => ({
        isDarkMode,
        toggleTheme,
        posts,
        addPost,
        updatePost,
        deletePost: handleDeletePost,
        filter,
        setFilter,
        filteredPosts,
        currentPost,
        setCurrentPost,
        view,
        setView,
        handleNewPost,
        handleEditPost,
        handleSavePost,
        handleCancel,
        handleUseIdea,
        showSuccessNotification,
    }), [
        isDarkMode, toggleTheme, posts, addPost, updatePost, handleDeletePost, filter, setFilter, filteredPosts,
        currentPost, view, handleNewPost, handleEditPost, handleSavePost, handleCancel, handleUseIdea, showSuccessNotification
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
            {/* You can move the global success notification here */}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
