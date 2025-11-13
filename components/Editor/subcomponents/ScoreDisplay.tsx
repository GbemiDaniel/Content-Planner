import React from 'react';
import type { PostScore } from '../../../types';
import ScoreCircle from './ScoreCircle';

interface ScoreDisplayProps {
    score: PostScore;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
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
};

export default React.memo(ScoreDisplay);
