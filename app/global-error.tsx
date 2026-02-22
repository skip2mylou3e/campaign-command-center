'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>{error.message}</p>
          <button
            onClick={reset}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#fff', backgroundColor: '#00A5B5', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
