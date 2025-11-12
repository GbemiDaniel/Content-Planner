
import type { Status } from './types';

export const X_CHAR_LIMIT = 280;

export const STATUSES: Status[] = ['Idea', 'Perfect', 'Ready to Post'];

export const TONES: string[] = [
    'Educator',
    'Influencer',
    'Did You Know?',
    'Humorous',
    'Inspirational',
    'News Reporter',
    'Technical Explainer',
];

export const READINESS_CONFIG: Record<Status, { color: string; description: string }> = {
    'Idea': {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        description: 'Rough thoughts and creative sparks.'
    },
    'Perfect': {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        description: 'Refined content, needs final review.'
    },
    'Ready to Post': {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        description: 'Finalized and ready to be published.'
    }
};

export const TONE_COLORS: Record<string, string> = {
    'Educator': 'bg-sky-500/80',
    'Influencer': 'bg-pink-500/80',
    'Did You Know?': 'bg-amber-500/80',
    'Humorous': 'bg-orange-500/80',
    'Inspirational': 'bg-purple-500/80',
    'News Reporter': 'bg-red-500/80',
    'Technical Explainer': 'bg-indigo-500/80',
};