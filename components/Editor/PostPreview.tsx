import React, { useState, useCallback } from 'react';
import type { Post } from '../../types';
import { Repeat, MessageCircle, Heart, BarChart2, Copy, Check } from 'lucide-react';
import GlassCard from '../Common/GlassCard';
import { highlightHashtagsAndMentionsInJSX } from '../../utils';

interface PostPreviewProps {
    post: Post;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
    const [copiedState, setCopiedState] = useState<'none' | 'thread' | number>('none');

    const handleCopy = useCallback((text: string, type: 'thread' | number) => {
        if (copiedState !== 'none') return;

        navigator.clipboard.writeText(text).then(() => {
            setCopiedState(type);
            setTimeout(() => setCopiedState('none'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text to clipboard.');
        });
    }, [copiedState]);

    const handleCopyThread = useCallback(() => {
        const fullText = post.content.map(c => c.text).join('\n\n');
        handleCopy(fullText, 'thread');
    }, [post.content, handleCopy]);

    const handleCopySingle = useCallback((text: string, index: number) => {
        handleCopy(text, index);
    }, [handleCopy]);
    
    return (
        <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Live Preview</h2>
                <button
                    onClick={handleCopyThread}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-gray-500/20 dark:bg-white/10 rounded-lg hover:bg-gray-500/30 dark:hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    disabled={copiedState !== 'none'}
                >
                    {copiedState === 'thread' ? <><Check size={16} className="text-green-400" />Copied!</> : <><Copy size={16} />Copy Thread</>}
                </button>
            </div>
            <div className="bg-gray-100/30 dark:bg-gray-800/50 p-4 rounded-lg">
                {post.content.map((item, index) => (
                    <div key={`${post.id}-${index}`} className={`flex items-start gap-3 ${index > 0 ? 'mt-3' : ''}`}>
                         {index > 0 && <div className="absolute left-[34px] -mt-3 h-3 border-l-2 border-gray-300 dark:border-gray-600"></div>}
                        <div className="flex-shrink-0 relative">
                            <img src={`https://picsum.photos/seed/${post.id}-${index}/48/48`} alt="Avatar" className="w-10 h-10 rounded-full" />
                            {index < post.content.length - 1 && <div className="absolute left-1/2 -translate-x-1/2 top-10 h-full border-l-2 border-gray-300 dark:border-gray-600"></div>}
                        </div>
                        <div className="w-full relative">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">you.eth</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">@you</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">· now</span>
                            </div>
                             <button 
                                onClick={() => handleCopySingle(item.text, index)}
                                disabled={copiedState !== 'none'}
                                className="absolute top-0 right-0 p-1 rounded-full text-gray-500 hover:bg-gray-500/20 hover:text-gray-200 transition-colors disabled:opacity-50"
                                aria-label="Copy post text"
                            >
                                {copiedState === index ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                            {item.text ? (
                                <p className="whitespace-pre-wrap break-words pr-8">{highlightHashtagsAndMentionsInJSX(item.text)}</p>
                            ) : !item.image ? (
                                <p className="text-gray-500">Your post will appear here...</p>
                            ) : null}
                            {item.image && (
                                <div className="mt-3">
                                    <img src={item.image} alt="Post image" className="rounded-2xl border border-gray-300/50 dark:border-gray-600/50 max-h-80 w-full object-cover" />
                                </div>
                            )}
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 mt-3 max-w-xs">
                                <div className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"><MessageCircle size={16} /><span className="text-xs">12</span></div>
                                <div className="flex items-center gap-1 hover:text-green-400 transition-colors cursor-pointer"><Repeat size={16} /><span className="text-xs">34</span></div>
                                <div className="flex items-center gap-1 hover:text-pink-400 transition-colors cursor-pointer"><Heart size={16} /><span className="text-xs">567</span></div>
                                <div className="flex items-center gap-1 hover:text-sky-400 transition-colors cursor-pointer"><BarChart2 size={16} /><span className="text-xs">8.9K</span></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 text-blue-300 rounded-lg text-sm">
                <strong>Trending Tip:</strong> Consider adding a relevant hashtag like #AI or #ContentCreation to increase visibility.
            </div>
        </GlassCard>
    );
};

export default React.memo(PostPreview);