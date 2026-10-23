export default function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-700/15 bg-red-50 p-3 text-xs leading-relaxed text-red-800"
    >
      {message}
    </p>
  );
}
