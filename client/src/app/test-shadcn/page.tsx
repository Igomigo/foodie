import { Button } from "@/components/ui/button";

export default function TestShadcnPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          shadcn/ui Test Page
        </h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Button Variants
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button size="lg" variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Button Sizes
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🔍</Button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Disabled States
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled Default</Button>
              <Button variant="destructive" disabled>
                Disabled Destructive
              </Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
            </div>
          </section>
        </div>

        <div className="mt-12 p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Setup Status: ✅ Complete
          </h3>
          <p className="text-muted-foreground">
            shadcn/ui has been successfully set up with Tailwind CSS v4. The
            components are working correctly with the new color system.
          </p>
        </div>
      </div>
    </div>
  );
}
