'use client';

import dynamic from 'next/dynamic';

const NewNoteForm = dynamic(() => import('./NewNoteForm'), { ssr: false });

export default NewNoteForm;
