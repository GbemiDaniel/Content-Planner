import React from 'react';

/**
 * Parses a string and wraps hashtags (#word) and mentions (@word) in a styled span.
 * @param text - The input text to parse.
 * @returns An array of strings and React elements.
 */
export const highlightHashtagsAndMentionsInJSX = (text: string) => {
    if (!text) return text;
    const parts = text.split(/([#@]\w+)/g);
    return parts.map((part, i) => {
        if (part.match(/([#@]\w+)/)) {
            // FIX: Replaced JSX with React.createElement to be compatible with .ts files.
            return React.createElement('span', { key: i, className: "text-blue-400" }, part);
        }
        return part;
    });
};