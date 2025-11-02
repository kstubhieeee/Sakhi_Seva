"use client"

import type React from "react"

import { motion } from "framer-motion"
import Link from "next/link"
import { GraduationCap, Store, Rocket, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Step = {
  title: string
  desc: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const steps: Step[] = [
  { title: "Learn", desc: "Chat with your AI trainer", Icon: GraduationCap },
  { title: "Create", desc: "Build your digital shop", Icon: Store },
  { title: "Grow", desc: "Sell and reach new markets", Icon: Rocket },
]

export function HowItWorks({ className }: { className?: string }) {
  return (
    <section aria-labelledby="how-it-works-title" className={cn("w-full bg-background", className)}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="text-sm font-medium tracking-wide text-primary uppercase">How it works</p>
          <h2 id="how-it-works-title" className="mt-2 text-balance text-3xl md:text-4xl font-semibold">
            Learn. Create. Grow.
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground leading-relaxed">
            Simple steps to start your digital journey with Sakhi‑Seva.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.45, delay: 0.08 * i, ease: "easeOut" }}
              className="rounded-2xl bg-card border border-border shadow-sm p-6 md:p-7"
            >
              <div className="flex items-start gap-4">
                <div
                  className="size-12 shrink-0 rounded-xl bg-accent/20 flex items-center justify-center shadow-sm"
                  aria-hidden="true"
                >
                  <s.Icon className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-10 md:mt-12"
        >
          <Link href="/auth/signup" className="inline-block">
            <Button
              size="lg"
              className={cn(
                "rounded-xl px-6 bg-primary text-primary-foreground shadow-sm",
                "transition-transform duration-200 ease-out hover:opacity-95 hover:-translate-y-[1px]",
              )}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
