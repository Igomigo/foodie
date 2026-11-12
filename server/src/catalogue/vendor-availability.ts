import { Vendor } from "../domain/vendor.model";

const nigeriaTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function vendorAvailability(
  vendor: Pick<Vendor, "approvalStatus" | "acceptingOrders" | "openingHours">,
  now = new Date(),
) {
  const parts = nigeriaTime.formatToParts(now);
  const day = weekdays.indexOf(
    parts.find((part) => part.type === "weekday")!.value,
  );
  const currentMinute =
    Number(parts.find((part) => part.type === "hour")!.value) * 60 +
    Number(parts.find((part) => part.type === "minute")!.value);
  const previousDay = (day + 6) % 7;

  const isOpen = (vendor.openingHours ?? []).some((hours) => {
    const start = minutes(hours.opensAt);
    const end = minutes(hours.closesAt);
    if (start === end) return false;
    if (end > start)
      return hours.day === day && currentMinute >= start && currentMinute < end;
    // An overnight shift also covers the beginning of the following day.
    return (
      (hours.day === day && currentMinute >= start) ||
      (hours.day === previousDay && currentMinute < end)
    );
  });

  return {
    isOpen,
    isAcceptingOrders:
      vendor.approvalStatus === "approved" &&
      vendor.acceptingOrders === true &&
      isOpen,
  };
}
