'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsPending(true);
    setError(null);
    const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Failed to delete. Please try again.');
      setIsPending(false);
      return;
    }
    dialogRef.current?.close();
    router.push('/dashboard');
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className='text-sm text-red-500 hover:text-red-700 focus-visible:outline-none focus-visible:underline transition-colors'
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className='rounded-xl p-6 shadow-xl backdrop:bg-black/40'
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          width: '320px',
        }}
      >
        <h2 className='text-base font-semibold text-gray-900 mb-2'>Delete note?</h2>
        <p className='text-sm text-gray-500 mb-6'>This cannot be undone.</p>
        {error && (
          <p role='alert' className='text-xs text-red-500 mb-3'>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => dialogRef.current?.close()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f3f4f6',
              border: 'none',
              color: '#374151',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#dc2626',
              border: 'none',
              color: '#fff',
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {isPending ? 'Deleting…' : 'OK'}
          </button>
        </div>
      </dialog>
    </>
  );
}
