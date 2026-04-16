export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <p>Public note – /p/{slug}</p>;
}
