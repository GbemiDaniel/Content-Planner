import { useState } from 'react';
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
            const newPosts = [...prevPosts];
            const existingIndex = newPosts.findIndex(p => p.id === postToUpdate.id);
            if (existingIndex > -1) {
                newPosts[existingIndex] = { ...postToUpdate, id: postToUpdate.id.startsWith('new-') ? Date.now().toString() : postToUpdate.id };
            }
            return newPosts;
        });
    };

    const deletePost = (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
        }
    };

    const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.status === filter);

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
