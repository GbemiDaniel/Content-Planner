import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Post, Status } from '../types';
import { useTheme, usePosts } from '../hooks';

type View = 'dashboard' | 'editor' | 'brainstorm' | 'analyzer';

interface SuccessNotification {
  id: number;
  message: string;
}

interface AppContextType {
    // Theme
    isDarkMode: boolean;
    toggleTheme: () => void;
    // Posts
    posts: Post[];
    deletePost: (id: string) => void;
    filter: Status | 'All';
    setFilter: (filter: Status | 'All') => void;
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
    // Notifications
    successNotification: SuccessNotification | null;
    showSuccessNotification: (message: string) => void;
    dismissSuccessNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
    
    const dismissSuccessNotification = useCallback(() => {
        setSuccessNotification(null);
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
        if (postToSave.id.startsWith('new-')) {
            addPost(postToSave);
            showSuccessNotification("Post created successfully!");
        } else {
            updatePost(postToSave);
            showSuccessNotification("Post updated successfully!");
        }
        setCurrentPost(null);
        setView('dashboard');
    }, [addPost, updatePost, showSuccessNotification]);
    
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
        successNotification,
        showSuccessNotification,
        dismissSuccessNotification,
    }), [
        isDarkMode, toggleTheme, posts, handleDeletePost, filter, setFilter, filteredPosts,
        currentPost, view, handleNewPost, handleEditPost, handleSavePost, handleCancel, handleUseIdea, 
        successNotification, showSuccessNotification, dismissSuccessNotification
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
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
