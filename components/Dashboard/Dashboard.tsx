import React, { Suspense } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAppContext } from '../../contexts';
import PostPreview from '../Editor/PostPreview';
import ContentList from '../ContentList/ContentList';
import Welcome from './Welcome';

// Lazy load feature components for better initial load performance
const LazyContentCreator = React.lazy(() => import('../Editor/ContentCreator'));
const LazyBrainstormer = React.lazy(() => import('../Brainstorm/Brainstormer'));
const LazyPostAnalyzer = React.lazy(() => import('../Learn/PostAnalyzer'));

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full min-h-[400px]">
        <LoaderCircle className="animate-spin text-purple-400" size={48} />
    </div>
);

const Dashboard: React.FC = () => {
    const { view, currentPost, filteredPosts, handleEditPost, deletePost, filter, setFilter } = useAppContext();

    const renderView = () => {
        switch (view) {
            case 'editor':
                return <LazyContentCreator />;
            case 'brainstorm':
                return <LazyBrainstormer />;
            case 'analyzer':
                return <LazyPostAnalyzer />;
            case 'dashboard':
            default:
                // No need to lazy load the welcome screen as it's the default view
                return <Welcome />;
        }
    }
    
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-7 space-y-8">
                <Suspense fallback={<LoadingSpinner />}>
                    {renderView()}
                </Suspense>
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
    );
};

export default Dashboard;