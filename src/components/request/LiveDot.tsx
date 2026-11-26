export function LiveDot({ live, label }: { live: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${live ? "text-ok" : "text-muted"}`}>
      <span className="relative flex h-2.5 w-2.5">
        {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? "bg-ok" : "bg-muted"}`} />
      </span>
      {label}
    </span>
  );
}
