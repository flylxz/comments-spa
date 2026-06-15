import { QueryProvider } from '@/app/providers/QueryProvider';

export const App = () => (
  <QueryProvider>
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Comments SPA</h1>
    </main>
  </QueryProvider>
);
