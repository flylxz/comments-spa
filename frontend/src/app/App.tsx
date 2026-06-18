import { CommentSection } from '@/widgets/comment-section';
import { QueryProvider } from './providers/QueryProvider';

const App = () => {
  return (
    <QueryProvider>
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">Секция комментариев</h1>
        <CommentSection />
      </main>
    </QueryProvider>
  );
};

export default App;
