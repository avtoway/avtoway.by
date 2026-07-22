export default function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-0.5 text-xs text-red-400">{error}</p>;
}
