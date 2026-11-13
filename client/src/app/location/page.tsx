import LocationFlow from "@/components/location/LocationFlow";

export default async function LocationPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return (
    <LocationFlow returnTo={returnTo === "settings" ? "/settings" : "/home"} />
  );
}
