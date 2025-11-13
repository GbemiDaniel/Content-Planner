import React from 'react';
import type { Post, Status } from '../../types';
import { STATUSES, READINESS_CONFIG } from '../../constants';
import GlassCard from '../Common/GlassCard';
import PostListItem from './PostListItem';

interface ContentListProps {
    posts: Post[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    filter: Status | 'All';
    setFilter: (filter: Status | 'All') => void;
    currentPostId?: string;
}

const ContentList: React.FC<ContentListProps> = ({ posts, onEdit, onDelete, filter, setFilter, currentPostId }) => {
    return (
        <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Your Content</h2>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4 border-b border-white/20 dark:border-white/10 pb-4">
                <button
                    onClick={() => setFilter('All')}
                    className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                        filter === 'All'
                            ? 'bg-purple-500/30 text-purple-300 border-purple-500/40'
                            : 'bg-gray-200/50 dark:bg-gray-700/50 border-transparent hover:border-gray-400/50'
                    }`}
                >
                    All
                </button>
                {STATUSES.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                            filter === status
                                ? `${READINESS_CONFIG[status].color} border-opacity-100`
                                : 'bg-gray-200/50 dark:bg-gray-700/50 border-transparent hover:border-gray-400/50'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Posts List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {posts.length > 0 ? posts.map(post => (
                    <PostListItem 
                        key={post.id}
                        post={post}
                        currentPostId={currentPostId}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No posts match your filter.</p>
                        <p className="text-sm">Create a new post to get started!</p>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default ContentList;