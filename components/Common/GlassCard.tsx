import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
    return (
        <div
            className={`bg-white/40 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-lg ${className}`}
        >
            {children}
        </div>
    );
};

export default React.memo(GlassCard);
