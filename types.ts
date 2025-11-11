export type Status = 'Idea' | 'Perfect' | 'Ready to Post';
export type Tone = 'Educator' | 'Influencer' | 'Did You Know?' | 'Humorous' | 'Inspirational' | 'News Reporter' | 'Technical Explainer';

export interface PostContent {
    text: string;
    image?: string | null;
}

export interface Post {
    id: string;
    content: PostContent[];
    status: Status;
    tones: Tone[];
    createdAt: string;
    scheduledAt?: string | null;
}
