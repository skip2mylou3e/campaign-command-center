'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <h2 className="text-lg font-semibold text-dd-slate mb-2">Something went wrong</h2>
      <p className="text-sm text-dd-gray mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm bg-dd-teal text-white rounded-lg hover:bg-dd-teal-dark transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
