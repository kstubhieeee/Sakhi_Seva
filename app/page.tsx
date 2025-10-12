import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/home/hero"
import { FeatureCards } from "@/components/home/feature-cards"
import { SuccessStories } from "@/components/home/success-stories"
import { HowItWorks } from "@/components/home/how-it-works"

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <section aria-label="Learning pillars" className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <FeatureCards />
      </section>

      <section aria-label="How it works" className="mx-auto max-w-6xl px-4 pb-12 md:pb-16">
        <HowItWorks />
      </section>

      <section aria-label="Success Stories" className="mx-auto max-w-6xl px-4 pb-12 md:pb-16">
        <SuccessStories />
      </section>
    </main>
  )
}
