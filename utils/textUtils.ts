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
            return React.createElement('span', { key: i, className: "text-blue-400" }, part);
        }
        return part;
    });
};

/**
 * A simple markdown to HTML renderer for AI analysis results.
 * Handles headings, bold text, blockquotes, and unordered lists.
 * @param markdownText The markdown text to convert.
 * @returns An HTML string.
 */
export const renderSimpleMarkdown = (markdownText: string | null): string => {
    if (!markdownText) return '';
    const html = markdownText
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-purple-300">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-500 pl-4 my-2 italic bg-black/10 dark:bg-white/5 p-2 rounded-r-lg">$1</blockquote>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/<\/li>\s*<li>/g, '</li><li>')
        .replace(/<li>/g, '<ul><li>')
        .replace(/<\/li>(?!<ul><li>)/g, '</li></ul>');

    const finalHtml = html.replace(/<\/ul>\s*<ul>/g, '');
    return finalHtml;
};
