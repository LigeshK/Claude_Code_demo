export default async function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <p>Note editor – /notes/{id}</p>;
}
