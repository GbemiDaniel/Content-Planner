import React from 'react';
import type { Post, Status, Tone } from '../types';
import { X_CHAR_LIMIT, STATUSES, TONES, READINESS_CONFIG, TONE_COLORS } from '../constants';
import { Plus, Trash2, BrainCircuit, X, Save, ImagePlus, CalendarClock } from 'lucide-react';
import GlassCard from './GlassCard';

interface ContentCreatorProps {
    post: Post;
    setPost: React.Dispatch<React.SetStateAction<Post | null>>;
    onSave: (post: Post) => void;
    onCancel: () => void;
    onCheckReadiness: () => void;
    isCheckingReadiness: boolean;
    aiFeedback: string | null;
    error: string | null;
    setError: (error: string | null) => void;
    clearAiFeedback: () => void;
}

const ContentCreator: React.FC<ContentCreatorProps> = ({
    post, setPost, onSave, onCancel, onCheckReadiness, isCheckingReadiness, aiFeedback, error, setError, clearAiFeedback
}) => {
    
    const updateContentText = (index: number, text: string) => {
        if (!post) return;
        const newContent = post.content.map((item, i) =>
            i === index ? { ...item, text } : item
        );
        setPost({ ...post, content: newContent });
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (!post) return;
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newContent = post.content.map((item, i) =>
                    i === index ? { ...item, image: reader.result as string } : item
                );
                setPost({ ...post, content: newContent });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };
    
    const removeImage = (index: number) => {
        if (!post) return;
        const newContent = post.content.map((item, i) =>
            i === index ? { ...item, image: null } : item
        );
        setPost({ ...post, content: newContent });
    };

    const addPostToThread = () => {
        if (!post) return;
        setPost({ ...post, content: [...post.content, { text: '', image: null }] });
    };

    const removePostFromThread = (index: number) => {
        if (!post || post.content.length <= 1) return;
        const newContent = post.content.filter((_, i) => i !== index);
        setPost({ ...post, content: newContent });
    };
    
    const toggleTone = (tone: Tone) => {
        if (!post) return;
        const newTones = post.tones.includes(tone)
            ? post.tones.filter(t => t !== tone)
            : [...post.tones, tone];
        setPost({ ...post, tones: newTones });
    };

    const setStatus = (status: Status) => {
        if (!post) return;
        setPost({ ...post, status });
    };
    
    const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!post) return;
        const { value } = e.target;
        if (value) {
            setPost({ ...post, scheduledAt: new Date(value).toISOString() });
        } else {
            setPost({ ...post, scheduledAt: null });
        }
    };
    
    const formatDateTimeForInput = (isoString?: string | null): string => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const tzoffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
            return localISOTime;
        } catch (e) {
            return '';
        }
    };

    if (!post) return null;

    return (
        <GlassCard className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Content Editor</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Draft your next masterpiece.</p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
                <h3 className="font-semibold">Readiness Status</h3>
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatus(status)}
                            className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                                post.status === status
                                    ? `${READINESS_CONFIG[status].color} border-opacity-100`
                                    : 'bg-gray-200/50 dark:bg-gray-700/50 border-transparent hover:border-gray-400/50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Input */}
            <div className="space-y-4">
                {post.content.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 relative pl-8">
                        {post.content.length > 1 && (
                            <div className="absolute left-4 top-4 h-full border-l-2 border-gray-300 dark:border-gray-600"></div>
                        )}
                        <img src={`https://picsum.photos/seed/${index+1}/40/40`} alt="Avatar" className="w-8 h-8 rounded-full mt-2 z-10" />
                        <div className="w-full">
                            <textarea
                                value={item.text}
                                onChange={e => updateContentText(index, e.target.value)}
                                placeholder={index === 0 ? "What's happening?!" : "Add to your thread..."}
                                className="w-full p-3 bg-gray-200/50 dark:bg-gray-800/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
                                rows={3}
                            />
                            <div className="flex justify-between items-center mt-1 pr-2">
                                <div/>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${item.text.length > X_CHAR_LIMIT ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {item.text.length} / {X_CHAR_LIMIT}
                                    </span>
                                     <label htmlFor={`image-upload-${index}`} className="p-1 rounded-full text-gray-500 hover:bg-blue-500/20 hover:text-blue-500 transition-colors cursor-pointer">
                                        <ImagePlus size={18} />
                                    </label>
                                    <input id={`image-upload-${index}`} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => handleImageUpload(e, index)} />
                                </div>
                            </div>
                            {item.image && (
                                <div className="mt-2 relative w-fit">
                                    <img src={item.image} alt="Preview" className="rounded-lg max-h-48 border border-white/20" />
                                    <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors" aria-label="Remove image">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {post.content.length > 1 && (
                            <button onClick={() => removePostFromThread(index)} className="p-2 mt-1 rounded-full text-gray-500 hover:bg-red-500/20 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
                <button onClick={addPostToThread} className="ml-11 text-purple-500 flex items-center gap-2 hover:underline">
                    <Plus size={16} /> Add to thread
                </button>
            </div>
            
            {/* Tone Selector */}
            <div className="space-y-2">
                <h3 className="font-semibold">Select Tones for AI Check</h3>
                <div className="flex flex-wrap gap-2">
                    {TONES.map(tone => (
                        <button
                            key={tone}
                            onClick={() => toggleTone(tone)}
                            className={`px-3 py-1 text-sm rounded-full text-white transition-opacity ${
                                TONE_COLORS[tone]
                            } ${post.tones.includes(tone) ? 'opacity-100 ring-2 ring-offset-2 ring-offset-transparent ring-white/50' : 'opacity-60 hover:opacity-100'}`}
                        >
                            {tone}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Schedule Post */}
            <div className="space-y-2">
                <h3 className="font-semibold">Schedule Post (Optional)</h3>
                <div className="flex items-center gap-2">
                    <CalendarClock size={20} className="text-gray-500 dark:text-gray-400" />
                    <input
                        type="datetime-local"
                        value={formatDateTimeForInput(post.scheduledAt)}
                        onChange={handleScheduleChange}
                        className="bg-gray-200/50 dark:bg-gray-800/60 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
                    />
                    {post.scheduledAt && (
                        <button onClick={() => setPost({ ...post, scheduledAt: null })} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* AI Feedback Section */}
            {(aiFeedback || isCheckingReadiness || error) && (
                <div className="p-4 rounded-lg bg-black/10 dark:bg-white/5 space-y-3 relative">
                     {error && (
                        <div className="p-3 mb-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex justify-between items-center">
                            <p>{error}</p>
                            <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-white/10">
                                <X size={16} />
                            </button>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><BrainCircuit size={20} className="text-purple-400"/> AI Readiness Feedback</h3>
                        <button onClick={clearAiFeedback} className="p-1 rounded-full hover:bg-white/10">
                            <X size={16} />
                        </button>
                    </div>
                    {isCheckingReadiness && (
                        <div className="space-y-2">
                           <div className="relative w-full h-4 bg-gray-500/20 rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent w-1/2 h-full animate-shimmer"></div>
                            </div>
                           <div className="w-3/4 h-4 bg-gray-500/20 rounded-full"></div>
                        </div>
                    )}
                    {aiFeedback && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br />').replace(/\* \*(.*?)\* \*/g, '<strong>$1</strong>').replace(/\* (.*?)(<br \/>|$)/g, '<li>$1</li>').replace(/<\/li>/g, '</li></ul>').replace(/<li>/g, '<ul><li>') }}></div>}
                </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-4 pt-4 border-t border-white/20 dark:border-white/10">
                <button
                    onClick={onCheckReadiness}
                    disabled={isCheckingReadiness}
                    className="px-5 py-2.5 bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <BrainCircuit size={18} /> {isCheckingReadiness ? 'Analyzing...' : 'Check Readiness'}
                </button>
                <button
                    onClick={() => onSave(post)}
                    className="px-5 py-2.5 bg-green-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                    <Save size={18}/> Save Post
                </button>
            </div>
        </GlassCard>
    );
};

export default ContentCreator;
