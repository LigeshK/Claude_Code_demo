import { requireAuth } from '@/lib/auth';
import NewNoteFormClient from '@/components/NewNoteFormClient';

export const metadata = { title: 'New Note – NextNotes' };

export default async function NewNotePage() {
  await requireAuth();

  return (
    <main className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-6 text-xl font-bold text-gray-900'>New Note</h1>
      <NewNoteFormClient />
    </main>
  );
}
