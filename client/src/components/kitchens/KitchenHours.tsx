"use client";
import { ChevronDown, Clock3 } from "lucide-react";
import type { Kitchen } from "@/types/discovery";
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function timeLabel(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, "0")}` : ""} ${hour >= 12 && hour < 24 ? "pm" : "am"}`;
}
export function hoursLabel(hours?: Kitchen["openingHours"][number]) {
  if (!hours) return "Closed";
  if (hours.opensAt === "00:00" && hours.closesAt === "24:00")
    return "Open 24 hours";
  return `${timeLabel(hours.opensAt)} – ${timeLabel(hours.closesAt)}${hours.closesAt < hours.opensAt ? " (next day)" : ""}`;
}
export function kitchenHoursSummary(
  hours: Kitchen["openingHours"],
  now = new Date(),
) {
  const today = days.indexOf(
    new Intl.DateTimeFormat("en", {
      weekday: "long",
      timeZone: "Africa/Lagos",
    }).format(now),
  );
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Africa/Lagos",
  }).format(now);
  const overnight = hours.find(
    (entry) =>
      entry.day === (today + 6) % 7 &&
      entry.opensAt > entry.closesAt &&
      time < entry.closesAt,
  );
  return {
    today,
    label: overnight
      ? `Open until ${timeLabel(overnight.closesAt)}`
      : `Today · ${hoursLabel(hours.find((entry) => entry.day === today))}`,
  };
}
export default function KitchenHours({
  hours,
}: {
  hours: Kitchen["openingHours"];
}) {
  const { today, label } = kitchenHoursSummary(hours);
  return (
    <details className="group relative text-xs text-foodie-muted">
      <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-full px-3 focus-visible:outline-2 focus-visible:outline-foodie-action [&::-webkit-details-marker]:hidden">
        <Clock3 size={14} aria-hidden="true" />
        {label}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <dl className="mt-1 w-[min(300px,calc(100vw-48px))] space-y-2 rounded-2xl border border-foodie-line bg-foodie-paper p-4 text-left shadow-lg">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => (
          <div
            key={day}
            className={`flex justify-between gap-4 ${day === today ? "font-semibold text-foodie-forest" : ""}`}
          >
            <dt>{days[day]}</dt>
            <dd>{hoursLabel(hours.find((entry) => entry.day === day))}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
