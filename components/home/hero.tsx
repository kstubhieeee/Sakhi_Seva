"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { GraduationCap, Store, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/hero-illustration.jpg"
          alt="Illustration of women entrepreneurs learning and selling online"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background" aria-hidden />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-16 md:pt-14">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl"
            >
              Empowering Rural Women Entrepreneurs
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
              className="mt-3 max-w-prose text-pretty text-base leading-relaxed text-foreground/85 md:text-lg"
            >
              Learn digital skills, list local products, and access government schemes — all in Marathi-friendly
              experiences designed for community growth.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              <Button
                asChild
                className={cn(
                  "rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm",
                  "bg-primary text-primary-foreground hover:opacity-90",
                )}
              >
                <Link href="/training" aria-label="Start Training">
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap aria-hidden className="h-4 w-4" />
                    Start Training
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="secondary"
                className={cn(
                  "rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm",
                  "bg-accent text-accent-foreground hover:bg-accent/90",
                )}
              >
                <Link href="/marketplace" aria-label="Open Marketplace">
                  <span className="inline-flex items-center gap-2">
                    <Store aria-hidden className="h-4 w-4" />
                    Open Marketplace
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground bg-transparent"
              >
                <Link href="/schemes" aria-label="View Schemes">
                  <span className="inline-flex items-center gap-2">
                    <Landmark aria-hidden className="h-4 w-4" />
                    View Schemes
                  </span>
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.aside
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur"
            aria-label="Highlights"
          >
            <ul className="space-y-4">
              {[
                "Short regional-language videos with progress tracking",
                "Create and manage products to sell locally and online",
                "Discover schemes for women-led micro businesses",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-sm" />
                  <p className="text-sm leading-relaxed text-foreground/85">{text}</p>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
