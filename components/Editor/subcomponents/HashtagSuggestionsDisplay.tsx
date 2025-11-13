import React from 'react';

interface HashtagSuggestionsDisplayProps {
    text: string;
    onHashtagClick: (tag: string) => void;
}

const HashtagSuggestionsDisplay: React.FC<HashtagSuggestionsDisplayProps> = ({ text, onHashtagClick }) => {
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

export default React.memo(HashtagSuggestionsDisplay);
