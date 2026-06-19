import { useCommentSocket } from '@/entities/comment/api/useCommentSocket';
import { CommentSection } from '@/widgets/comment-section';
import { QueryProvider } from './providers/QueryProvider';

const AppContent = () => {
  useCommentSocket();

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <CommentSection />
    </main>
  );
};

const App = () => {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
};

export default App;
