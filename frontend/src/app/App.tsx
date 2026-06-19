import { CommentSection } from '@/widgets/comment-section';
import { QueryProvider } from './providers/QueryProvider';

const App = () => {
  return (
    <QueryProvider>
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <CommentSection />
      </main>
    </QueryProvider>
  );
};

export default App;
