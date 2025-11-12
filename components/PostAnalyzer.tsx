import React, { useState } from 'react';
import { BrainCircuit, FileSearch, LoaderCircle, X, AlertTriangle, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

interface PostAnalyzerProps {
    onAnalyze: (text: string) => void;
    isAnalyzing: boolean;
    analysisResult: string | null;
    onClose: () => void;
    error: string | null;
    setError: (error: string | null) => void;
    clearAnalysis: () => void;
}

const renderAnalysis = (markdownText: string) => {
    // This simple renderer handles headings, bold text, blockquotes, and unordered lists.
    const html = markdownText
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-purple-300">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-500 pl-4 my-2 italic bg-black/10 dark:bg-white/5 p-2 rounded-r-lg">$1</blockquote>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/<\/li>\s*<li>/g, '</li><li>') 
        .replace(/<li>/g, '<ul><li>') 
        .replace(/<\/li>(?!<ul><li>)/g, '</li></ul>'); 

    const finalHtml = html.replace(/<\/ul>\s*<ul>/g, ''); 

    return <div className="prose prose-sm dark:prose-invert max-w-none space-y-2" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};


const PostAnalyzer: React.FC<PostAnalyzerProps> = ({
    onAnalyze,
    isAnalyzing,
    analysisResult,
    onClose,
    error,
    setError,
    clearAnalysis
}) => {
    const [text, setText] = useState('');
    const [isUrl, setIsUrl] = useState(false);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        const urlRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i;
        setIsUrl(urlRegex.test(newText.trim()));
    };

    const handleAnalyzeClick = () => {
        if (!text.trim()) {
            setError("Please paste the text of your post to analyze.");
            return;
        }
        if (isUrl) {
            setError("Please paste the post's text content, not a URL.");
            return;
        }
        onAnalyze(text);
    };

    return (
        <GlassCard className="p-6 space-y-6 w-full animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <FileSearch className="text-green-400" />
                        Learn from a Past Post
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Paste your post's text to get AI-powered feedback.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {!analysisResult && (
                <div className="space-y-4">
                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Paste the full text of your X post (or a thread) here..."
                        className={`w-full p-3 bg-gray-200/50 dark:bg-gray-800/60 rounded-lg focus:outline-none transition-all min-h-[120px] ${isUrl ? 'focus:ring-2 focus:ring-cyan-500' : 'focus:ring-2 focus:ring-green-500'}`}
                        rows={5}
                        disabled={isAnalyzing}
                    />
                    {isUrl && (
                        <div className="p-3 text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg flex gap-3 items-center animate-fade-in">
                           <Sparkles className="flex-shrink-0" />
                           <div>
                                <strong>Feature Coming Soon!</strong> Analysis directly from a URL is on our roadmap. For now, please paste the post's text to get feedback.
                           </div>
                        </div>
                    )}
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isAnalyzing || !text.trim() || isUrl}
                        className="w-full px-4 py-2.5 bg-green-500/80 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <LoaderCircle size={18} className="animate-spin" /> Analyzing...
                            </>
                        ) : (
                            <>
                                <BrainCircuit size={18} /> Analyze Post
                            </>
                        )}
                    </button>
                </div>
            )}
            
            {error && (
                <div className="p-3 my-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg flex justify-between items-center">
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-white/10">
                        <X size={16} />
                    </button>
                </div>
            )}

            {isAnalyzing && !analysisResult && (
                <div className="p-4 rounded-lg bg-black/10 dark:bg-white/5 space-y-3">
                   <div className="relative w-full h-5 bg-gray-500/20 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/50 to-transparent w-1/2 h-full animate-shimmer"></div>
                    </div>
                   <div className="relative w-3/4 h-5 bg-gray-500/20 rounded-full overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/50 to-transparent w-1/2 h-full animate-shimmer"></div>
                   </div>
                    <div className="relative w-full h-5 bg-gray-500/20 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/50 to-transparent w-1/2 h-full animate-shimmer"></div>
                    </div>
                </div>
            )}
            
            {analysisResult && (
                <div className="p-4 rounded-lg bg-black/10 dark:bg-white/5 space-y-4">
                    {renderAnalysis(analysisResult)}
                    <button 
                        onClick={() => {
                            clearAnalysis();
                            setText('');
                            setIsUrl(false);
                        }}
                        className="w-full mt-4 px-4 py-2 bg-gray-500/60 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600/60 transition-colors flex items-center justify-center gap-2"
                    >
                        Analyze Another Post
                    </button>
                </div>
            )}
        </GlassCard>
    );
};

export default PostAnalyzer;