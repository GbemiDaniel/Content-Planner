import React, { useState, useEffect } from 'react';
import type { Post, Status, Tone, PostScore, ScoreMetric } from '../types';
import { X_CHAR_LIMIT, STATUSES, TONES, TONE_COLORS, READINESS_CONFIG } from '../constants';
import { Plus, Trash2, BrainCircuit, X, Save, ImagePlus, CalendarClock, Hash, Wand2, LoaderCircle, Star, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';
import { rephrasePost, formatPost } from '../services/geminiService';


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
    onSuggestHashtags: () => void;
    isSuggestingHashtags: boolean;
    hashtagSuggestions: string | null;
    clearHashtagSuggestions: () => void;
    showSuccessNotification: (message: string) => void;
    onScorePost: () => void;
    isScoringPost: boolean;
    postScore: PostScore | null;
    clearPostScore: () => void;
}

const HashtagSuggestionsDisplay: React.FC<{
    text: string;
    onHashtagClick: (tag: string) => void;
}> = ({ text, onHashtagClick }) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            {lines.map((line, lineIndex) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={lineIndex} className="font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1">{line.replace(/\*\*/g, '')}</h4>;
                }
                const parts = line.split(/(#\w+)/g);
                return (
                    <div key={lineIndex} className="my-1 flex flex-wrap items-center gap-x-1">
                        {parts.filter(part => part).map((part, partIndex) => {
                            if (part.startsWith('#')) {
                                return (
                                    <button
                                        key={partIndex}
                                        onClick={() => onHashtagClick(part)}
                                        className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md hover:bg-cyan-500/40 transition-colors my-0.5"
                                    >
                                        {part}
                                    </button>
                                );
                            }
                            return <span key={partIndex} className="text-gray-600 dark:text-gray-400">{part.replace(/\*/g, '')}</span>;
                        })}
                    </div>
                );
            })}
        </div>
    );
};

const ScoreCircle: React.FC<{ score: number, size?: 'sm' | 'lg' }> = ({ score, size = 'sm' }) => {
  const isLarge = size === 'lg';
  const radius = isLarge ? 36 : 24;
  const strokeWidth = isLarge ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;
  const color = score >= 8 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';
  const dimension = isLarge ? 'w-24 h-24' : 'w-16 h-16';
  const svgDimension = isLarge ? 88 : 60;
  const center = svgDimension / 2;

  return (
    <div className={`relative ${dimension}`}>
      <svg className="w-full h-full" viewBox={`0 0 ${svgDimension} ${svgDimension}`}>
        <circle
          className="text-gray-600/50"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          className={`${color} transition-all duration-1000 ease-in-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-bold ${isLarge ? 'text-3xl' : 'text-lg'}`}>{score}</span>
    </div>
  );
};

const ScoreDisplay: React.FC<{ score: PostScore }> = ({ score }) => {
    const metrics = [
        { name: 'Engagement', data: score.engagement },
        { name: 'Clarity', data: score.clarity },
        { name: 'Tone Alignment', data: score.toneAlignment },
    ];
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-2 p-4 bg-black/20 rounded-lg">
                <h4 className="font-bold text-xl">Overall Score</h4>
                <ScoreCircle score={score.overall.score} size="lg" />
                <p className="text-center text-sm text-gray-300 mt-2">{score.overall.rationale}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3 gap-4 text-center">
                {metrics.map(metric => (
                    <div key={metric.name} className="flex flex-col items-center gap-2 p-3 bg-black/10 rounded-lg">
                        <h5 className="font-semibold text-base">{metric.name}</h5>
                        <ScoreCircle score={metric.data.score} />
                        <p className="text-xs text-gray-400 mt-1">{metric.data.rationale}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

const ContentCreator: React.FC<ContentCreatorProps> = ({
    post, setPost, onSave, onCancel, onCheckReadiness, isCheckingReadiness, aiFeedback, error, setError, clearAiFeedback, onSuggestHashtags, isSuggestingHashtags, hashtagSuggestions, clearHashtagSuggestions, showSuccessNotification, onScorePost, isScoringPost, postScore, clearPostScore
}) => {
    const [activeContentIndex, setActiveContentIndex] = useState(0);
    const [customTone, setCustomTone] = useState('');
    const [rephrasingIndex, setRephrasingIndex] = useState<number | null>(null);
    const [formattingIndex, setFormattingIndex] = useState<number | null>(null);


    useEffect(() => {
        if (post) {
            setActiveContentIndex(post.content.length - 1);
        }
    }, [post]);

    const updateContentText = (index: number, text: string) => {
        if (!post) return;
        const newContent = post.content.map((item, i) =>
            i === index ? { ...item, text } : item
        );
        setPost({ ...post, content: newContent });
    };

    const handleRephrase = async (index: number) => {
        if (!post || rephrasingIndex !== null || formattingIndex !== null) return;
        
        const originalText = post.content[index].text;
        if (!originalText.trim()) {
            setError("Cannot rephrase an empty post.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        setRephrasingIndex(index);
        setError(null);
        try {
            const rephrasedText = await rephrasePost(originalText, post.tones);
            updateContentText(index, rephrasedText);
            showSuccessNotification(`Post #${index + 1} rephrased!`);
        } catch (e: any) {
            setError(`AI rephrase failed: ${e.message}`);
        } finally {
            setRephrasingIndex(null);
        }
    };
    
    const handleFormatPost = async (index: number) => {
        if (!post || rephrasingIndex !== null || formattingIndex !== null) return;
        
        const originalText = post.content[index].text;
        if (!originalText.trim()) {
            setError("Cannot format an empty post.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        setFormattingIndex(index);
        setError(null);
        try {
            const formattedText = await formatPost(originalText, post.tones);
            updateContentText(index, formattedText);
            showSuccessNotification(`Post #${index + 1} formatted!`);
        } catch (e: any) {
            setError(`AI formatting failed: ${e.message}`);
        } finally {
            setFormattingIndex(null);
        }
    };

    const handleHashtagClick = (hashtag: string) => {
        if (!post) return;

        const targetIndex = activeContentIndex < post.content.length ? activeContentIndex : post.content.length - 1;
        const currentText = post.content[targetIndex].text;

        const cleanedHashtag = hashtag.match(/#\w+/g)?.[0] ?? hashtag;
        if (currentText.includes(cleanedHashtag)) return;
        
        const newText = currentText.trim() ? `${currentText.trim()} ${cleanedHashtag}` : cleanedHashtag;

        if (newText.length > X_CHAR_LIMIT) {
            setError(`Adding "${cleanedHashtag}" exceeds the character limit for this post.`);
            setTimeout(() => setError(null), 3000);
            return;
        }

        updateContentText(targetIndex, newText);
        showSuccessNotification(`'${cleanedHashtag}' added to post #${targetIndex + 1}`);
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

    const handleAddCustomTone = () => {
        if (!post || !customTone.trim() || post.tones.includes(customTone.trim())) {
            setCustomTone('');
            return;
        }
        setPost({ ...post, tones: [...post.tones, customTone.trim()] });
        setCustomTone('');
    };

    const removeTone = (toneToRemove: Tone) => {
        if (!post) return;
        setPost({ ...post, tones: post.tones.filter(t => t !== toneToRemove) });
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

    const isAiBusy = isCheckingReadiness || isSuggestingHashtags || rephrasingIndex !== null || isScoringPost || formattingIndex !== null;

    if (!post) return null;
    
    const toneSelectorJsx = (
        <div className="space-y-3">
            <h3 className="font-semibold text-base">Select Tones for AI</h3>
             {post.tones.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    {post.tones.map(tone => (
                        <span key={tone} className={`px-2.5 py-1 text-sm rounded-full text-white flex items-center gap-1.5 ${TONE_COLORS[tone] || 'bg-gray-500/80'}`}>
                            {tone}
                            <button onClick={() => removeTone(tone)} className="bg-white/20 rounded-full p-0.5 hover:bg-white/40"><X size={12}/></button>
                        </span>
                    ))}
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {TONES.filter(t => !post.tones.includes(t)).map(tone => (
                    <button key={tone} onClick={() => toggleTone(tone)} className={`px-3 py-1 text-sm rounded-full text-white transition-opacity opacity-70 hover:opacity-100 ${TONE_COLORS[tone]}`}>
                        + {tone}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
                <input type="text" value={customTone} onChange={(e) => setCustomTone(e.target.value)} placeholder="Add a custom tone..." onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTone()} className="flex-grow p-2 text-sm bg-gray-200/50 dark:bg-gray-800/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                <button onClick={handleAddCustomTone} className="px-3 py-2 text-sm bg-gray-500/60 text-white rounded-lg hover:bg-gray-600/60 transition-colors">Add</button>
            </div>
        </div>
    );
    
    const statusSelectorJsx = (
        <div className="space-y-2">
            <h3 className="font-semibold text-base">Readiness Status</h3>
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
    );

    return (
        <GlassCard className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Content Editor</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Draft your next masterpiece.</p>
                </div>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-x-8 gap-y-6">
                
                <div className="space-y-6 xl:hidden">
                    {toneSelectorJsx}
                    {statusSelectorJsx}
                </div>
                
                {/* Main Content Area */}
                <div className="xl:col-span-2 space-y-4">
                    {post.content.map((item, index) => (
                        <div key={index} className={`p-2 rounded-lg transition-all duration-300 ${index === activeContentIndex ? 'bg-cyan-500/10 ring-1 ring-cyan-500' : ''}`}>
                            <div className="flex items-start gap-3 relative pl-8">
                                {post.content.length > 1 && (
                                    <div className="absolute left-4 top-4 h-full border-l-2 border-gray-300 dark:border-gray-600"></div>
                                )}
                                <img src={`https://picsum.photos/seed/${index+1}/40/40`} alt="Avatar" className="w-8 h-8 rounded-full mt-2 z-10" />
                                <div className="w-full">
                                    <textarea
                                        value={item.text}
                                        onFocus={() => setActiveContentIndex(index)}
                                        onChange={e => updateContentText(index, e.target.value)}
                                        placeholder={index === 0 ? "What's happening?!" : "Add to your thread..."}
                                        className="w-full p-3 bg-gray-200/50 dark:bg-gray-800/60 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
                                        rows={5}
                                    />
                                    {index === activeContentIndex && (
                                        <div className="flex justify-between items-center mt-1 pr-2 animate-fade-in">
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => handleRephrase(index)}
                                                    disabled={isAiBusy}
                                                    title="Rephrase with AI"
                                                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {rephrasingIndex === index ? (
                                                        <><LoaderCircle size={14} className="animate-spin" />Rephrasing...</>
                                                    ) : (
                                                        <><Wand2 size={14} />Rephrase</>
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={() => handleFormatPost(index)}
                                                    disabled={isAiBusy}
                                                    title="Format with AI"
                                                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {formattingIndex === index ? (
                                                        <><LoaderCircle size={14} className="animate-spin" />Formatting...</>
                                                    ) : (
                                                        <><Sparkles size={14} />Magic Format</>
                                                    )}
                                                </button>
                                            </div>
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
                                    )}
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
                        </div>
                    ))}
                    <button onClick={addPostToThread} className="ml-11 text-purple-500 flex items-center gap-2 hover:underline">
                        <Plus size={16} /> Add to thread
                    </button>
                </div>

                {/* Sidebar / Inspector */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="hidden xl:block xl:space-y-6">
                        {toneSelectorJsx}
                        {statusSelectorJsx}
                    </div>
                     {/* Schedule Post */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">Schedule Post (Optional)</h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="datetime-local"
                                value={formatDateTimeForInput(post.scheduledAt)}
                                onChange={handleScheduleChange}
                                className="w-full bg-gray-200/50 dark:bg-gray-800/60 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
                            />
                            {post.scheduledAt && (
                                <button onClick={() => setPost({ ...post, scheduledAt: null })} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* AI Toolkit */}
                    <div className="space-y-3 pt-4 border-t border-white/10 dark:border-white/5">
                        <h3 className="font-semibold text-base">AI Toolkit</h3>
                        <div className="grid grid-cols-1 gap-2">
                             <button onClick={onScorePost} disabled={isAiBusy} className="w-full px-4 py-2 text-sm bg-yellow-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Star size={16} /> {isScoringPost ? 'Scoring...' : 'Score Post'}
                            </button>
                            <button onClick={onSuggestHashtags} disabled={isAiBusy} className="w-full px-4 py-2 text-sm bg-cyan-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Hash size={16} /> {isSuggestingHashtags ? 'Thinking...' : 'Suggest Hashtags'}
                            </button>
                            <button onClick={onCheckReadiness} disabled={isAiBusy} className="w-full px-4 py-2 text-sm bg-purple-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <BrainCircuit size={16} /> {isCheckingReadiness ? 'Analyzing...' : 'Check Readiness'}
                            </button>
                        </div>
                    </div>

                    {/* AI Analysis Display */}
                    <div className="space-y-4">
                        {error && (
                            <div className="p-3 my-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex justify-between items-center">
                                <p className="text-sm">{error}</p>
                                <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button>
                            </div>
                        )}
                        {(postScore || isScoringPost) && (
                            <div className="p-4 rounded-lg bg-black/10 dark:bg-white/5 space-y-3 relative">
                                <div className="flex justify-between items-center"><h3 className="font-semibold text-lg flex items-center gap-2"><Star size={20} className="text-yellow-400"/> AI Post Score</h3><button onClick={clearPostScore} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button></div>
                                {isScoringPost && <div className="h-48 flex items-center justify-center"><LoaderCircle className="animate-spin text-yellow-400" size={32} /></div>}
                                {postScore && <ScoreDisplay score={postScore} />}
                            </div>
                        )}
                        {(hashtagSuggestions || isSuggestingHashtags) && (
                            <div className="p-4 rounded-lg bg-black/10 dark:bg-white/5 space-y-3 relative">
                                <div className="flex justify-between items-center"><h3 className="font-semibold text-lg flex items-center gap-2"><Hash size={20} className="text-cyan-400"/> AI Hashtag Suggestions</h3><button onClick={clearHashtagSuggestions} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button></div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Click a tag to add it to the selected post.</p>
                                {isSuggestingHashtags && <div className="h-24 flex items-center justify-center"><LoaderCircle className="animate-spin text-cyan-400" size={32} /></div>}
                                {hashtagSuggestions && <HashtagSuggestionsDisplay text={hashtagSuggestions} onHashtagClick={handleHashtagClick} />}
                            </div>
                        )}
                        {(aiFeedback || isCheckingReadiness) && (
                            <div className="p-4 rounded-lg bg-black/10 dark:bg-white/5 space-y-3 relative">
                                <div className="flex justify-between items-center"><h3 className="font-semibold text-lg flex items-center gap-2"><BrainCircuit size={20} className="text-purple-400"/> AI Readiness Feedback</h3>{(aiFeedback || error) && <button onClick={clearAiFeedback} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button>}</div>
                                {isCheckingReadiness && <div className="h-24 flex items-center justify-center"><LoaderCircle className="animate-spin text-purple-400" size={32} /></div>}
                                {aiFeedback && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: aiFeedback.replace(/\n/g, '<br />').replace(/\* \*(.*?)\* \*/g, '<strong>$1</strong>').replace(/\* (.*?)(<br \/>|$)/g, '<li>$1</li>').replace(/<\/li>/g, '</li></ul>').replace(/<li>/g, '<ul><li>') }}></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Save Button Footer */}
            <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-white/20 dark:border-white/10">
                <button
                    onClick={() => onSave(post)}
                    className="px-6 py-3 bg-green-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                    <Save size={18}/> Save Post
                </button>
            </div>
        </GlassCard>
    );
};

export default ContentCreator;