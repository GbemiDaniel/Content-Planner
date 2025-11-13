export type Status = 'Idea' | 'Perfect' | 'Ready to Post';
export type Tone = string;

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

export interface ScoreMetric {
  score: number;
  rationale: string;
}

export interface PostScore {
  engagement: ScoreMetric;
  clarity: ScoreMetric;
  toneAlignment: ScoreMetric;
  overall: ScoreMetric;
}
