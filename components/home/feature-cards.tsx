"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

const items = [
  { title: "Digital Basics", desc: "Use smartphone and apps confidently." },
  { title: "Online Selling", desc: "Learn listing, pricing, and shipping." },
  { title: "Financial Literacy", desc: "Understand UPI, loans and budgeting." },
]

export function FeatureCards() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, delay: i * 0.06 }}
        >
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">{c.desc}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
