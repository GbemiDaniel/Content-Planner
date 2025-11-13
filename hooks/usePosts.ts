import { useState, useMemo } from 'react';
import type { Post, Status } from '../types';
import { usePersistentState } from './usePersistentState';

/**
 * Manages the state and operations for posts, including persistence to localStorage.
 */
export function usePosts() {
    const [posts, setPosts] = usePersistentState<Post[]>('x-content-planner-posts', []);
    const [filter, setFilter] = useState<Status | 'All'>('All');

    const addPost = (post: Post) => {
        const newPost = { ...post, id: Date.now().toString() };
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const updatePost = (postToUpdate: Post) => {
        setPosts(prevPosts => {
            return prevPosts.map(p => p.id === postToUpdate.id ? postToUpdate : p);
        });
    };

    const deletePost = (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
        }
    };

    const filteredPosts = useMemo(() => {
        if (filter === 'All') {
            return posts;
        }
        return posts.filter(p => p.status === filter);
    }, [posts, filter]);


    return {
        posts,
        addPost,
        updatePost,
        deletePost,
        filter,
        setFilter,
        filteredPosts,
    };
}
