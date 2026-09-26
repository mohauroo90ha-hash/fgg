import { cn } from "@/lib/utils";

const tones = {
  default: "bg-zinc-100 text-zinc-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  accent: "bg-accent/20 text-brand",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const map: Record<string, keyof typeof tones> = {
    ACTIVE: "green",
    DRAFT: "amber",
    PENDING: "amber",
    PAID: "blue",
    SHIPPED: "purple",
    DELIVERED: "green",
    CANCELLED: "red",
  };
  const tone = map[status] ?? "default";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
    </span>
  );
}
