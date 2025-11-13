import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useAppContext } from '../../contexts';
import { ContentCreator, PostPreview } from '../Editor';
// FIX: Changed import to default due to module resolution ambiguity.
import ContentList from '../ContentList';
import { Brainstormer } from '../Brainstorm';
import { PostAnalyzer } from '../Learn';
import { GlassCard } from '../Common';
import Welcome from './Welcome';

export const Dashboard: React.FC = () => {
    const { view, currentPost, filteredPosts, handleEditPost, deletePost, filter, setFilter } = useAppContext();

    const renderView = () => {
        switch (view) {
            case 'editor':
                return <ContentCreator />;
            case 'brainstorm':
                return <Brainstormer />;
            case 'analyzer':
                return <PostAnalyzer />;
            case 'dashboard':
            default:
                return <Welcome />;
        }
    }
    
    // Note: SuccessNotification could be made global in App.tsx if needed elsewhere
    // For now, keeping it here as it was in the original structure.
    const [successNotification, setSuccessNotification] = React.useState<{id: number, message: string} | null>(null);


    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-7 space-y-8">
                    {renderView()}
                </div>
                <div className="xl:col-span-5 space-y-8">
                    {currentPost && <PostPreview post={currentPost} />}
                    <ContentList
                        posts={filteredPosts}
                        onEdit={handleEditPost}
                        onDelete={deletePost}
                        filter={filter}
                        setFilter={setFilter}
                        currentPostId={currentPost?.id}
                    />
                </div>
            </div>

            {successNotification && (
                 <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-in-bottom w-max max-w-[90vw]">
                    <GlassCard className="!p-0">
                        <div className="flex items-center gap-3 pl-4 pr-2 py-3 bg-green-500/20 text-green-300">
                            <CheckCircle size={20} />
                            <p className="font-medium text-sm">{successNotification.message}</p>
                            <button onClick={() => setSuccessNotification(null)} className="p-1 rounded-full hover:bg-white/10 ml-2">
                                <X size={16} />
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </>
    );
};