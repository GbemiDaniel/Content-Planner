import React, { useState, useEffect } from 'react';
import type { Post } from '../../types';
import { READINESS_CONFIG } from '../../constants';
import { Edit, Trash2, Clock } from 'lucide-react';

interface PostListItemProps {
    post: Post;
    currentPostId?: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const calculateTimeLeft = (scheduleDate?: string | null) => {
    if (!scheduleDate) return null;
    const difference = +new Date(scheduleDate) - +new Date();
    if (difference <= 0) return { expired: true };

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds, expired: false };
};

const PostListItem: React.FC<PostListItemProps> = ({ post, currentPostId, onEdit, onDelete }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(post.scheduledAt));

    useEffect(() => {
        if (!post.scheduledAt || timeLeft?.expired) return;
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(post.scheduledAt));
        }, 1000);
        return () => clearInterval(timer);
    }, [post.scheduledAt, timeLeft?.expired]);

    const renderTimeInfo = () => {
        if (post.scheduledAt) {
            if (timeLeft?.expired) {
                return <span className="text-xs text-yellow-400 flex items-center gap-1"><Clock size={12}/> Schedule Passed</span>;
            }
            if (timeLeft) {
                const { days, hours, minutes, seconds } = timeLeft;
                return <span className="text-xs text-cyan-300 font-mono flex items-center gap-1"><Clock size={12} />{days > 0 && `${days}d `}{`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}</span>;
            }
        }
        return <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>;
    };

    return (
        <div className={`p-3 rounded-lg transition-all duration-300 flex justify-between items-start ${currentPostId === post.id ? 'bg-purple-500/30' : 'bg-black/10 dark:bg-white/5 hover:bg-black/20 dark:hover:bg-white/10'}`}>
            <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{post.content[0]?.text || "Untitled Post"}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${READINESS_CONFIG[post.status].color}`}>{post.status}</span>
                    {renderTimeInfo()}
                </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
                <button onClick={() => onEdit(post.id)} className="p-2 rounded-full hover:bg-white/20 text-blue-400"><Edit size={16} /></button>
                <button onClick={() => onDelete(post.id)} className="p-2 rounded-full hover:bg-white/20 text-red-400"><Trash2 size={16} /></button>
            </div>
        </div>
    );
};

export default React.memo(PostListItem);