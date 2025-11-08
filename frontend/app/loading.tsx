import LoadingScreen from '@/components/ui/LoadingScreen';

export default function GlobalLoading() {
  // Keep this lightweight — Next.js will render this during route transitions and suspense boundaries
  return <LoadingScreen variant="futuristic" />;
}
