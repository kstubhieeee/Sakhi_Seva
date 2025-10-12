"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlayCircle, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

type Story = {
  name: string
  location: string
  quote: string
  image: string
  videoUrl?: string
}

const stories: Story[] = [
  {
    name: "Meera Jadhav",
    location: "Nashik",
    quote:
      "After joining Sakhi-Seva’s digital training, Meera launched her handmade jewelry shop online and doubled her orders in 3 months.",
    image: "/portrait-of-rural-woman-entrepreneur-smiling.jpg",
    videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
  },
  {
    name: "Asha Patil",
    location: "Kolhapur",
    quote:
      "Asha learned pricing and product photography basics. Her organic spice mixes are now featured in local community markets.",
    image: "/portrait-of-woman-with-small-business-products.jpg",
  },
  {
    name: "Rekha Shinde",
    location: "Aurangabad",
    quote:
      "With the marketplace tools, Rekha listed her handwoven baskets and began receiving steady festival-season orders.",
    image: "/portrait-of-woman-with-small-business-products.jpg",
    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
  },
  {
    name: "Savita More",
    location: "Satara",
    quote:
      "Savita discovered new government schemes and secured a micro-grant that helped her expand her tailoring business.",
    image: "/portrait-of-tailor-with-sewing-machine.jpg",
  },
]

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function SuccessStories() {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur md:p-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2 variants={fadeIn} className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
          Inspiring Journeys
        </motion.h2>
        <motion.p
          variants={fadeIn}
          transition={{ delay: 0.1 }}
          className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 md:text-lg"
        >
          Discover how Sakhi-Seva has helped women across Maharashtra learn, grow, and build thriving businesses.
        </motion.p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((s, i) => (
          <motion.article
            key={s.name}
            variants={fadeIn}
            transition={{ delay: 0.05 * i }}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm",
              "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            <div className="relative">
              <Image
                src={s.image || "/placeholder.svg"}
                alt={`${s.name} — ${s.location}`}
                width={600}
                height={400}
                className="h-40 w-full object-cover sm:h-44"
                priority={i < 2}
              />
              {s.videoUrl ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="absolute inset-0 flex items-center justify-center bg-black/15 text-white transition-colors hover:bg-black/25 focus-visible:outline-none"
                      aria-label={`Play video testimonial of ${s.name}`}
                    >
                      <span className="sr-only">{`Play video testimonial of ${s.name}`}</span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-primary/95 px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm">
                        <PlayCircle aria-hidden className="h-4 w-4" />
                        Watch
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-2xl rounded-xl p-0 shadow-lg"
                    aria-label={`Video testimonial: ${s.name} from ${s.location}`}
                  >
                    <DialogHeader className="px-4 pt-4">
                      <DialogTitle className="text-base font-semibold">
                        {s.name} — {s.location}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video w-full overflow-hidden rounded-b-xl">
                      <iframe
                        title={`${s.name} testimonial video`}
                        src={s.videoUrl}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>

            <div className="space-y-2 px-4 py-4">
              <h3 className="text-pretty text-base font-semibold">
                {s.name} <span className="text-foreground/70">— {s.location}</span>
              </h3>
              <p className="text-sm leading-relaxed text-foreground/85">{s.quote}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <motion.div variants={fadeIn} transition={{ delay: 0.2 }} className="mt-8 flex justify-center">
        <Button
          asChild
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:opacity-90"
        >
          <Link href="/stories" aria-label="Read more success stories">
            <span className="inline-flex items-center gap-2">
              <BookOpen aria-hidden className="h-4 w-4" />
              Read More Stories
            </span>
          </Link>
        </Button>
      </motion.div>
    </motion.section>
  )
}
