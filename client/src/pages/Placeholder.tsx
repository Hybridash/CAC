export function Placeholder({ title }: { title: string }) {
  return (
    <div className="card p-10 text-center">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="text-ink-soft">Growing in the petri dish… 🧫</p>
    </div>
  );
}
