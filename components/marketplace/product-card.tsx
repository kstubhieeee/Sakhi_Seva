"use client"

import type React from "react"

type Product = {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  tags?: string[]
}

export function ProductCard({ product, actions }: { product: Product; actions?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <img
        src={product.image || "/placeholder.svg?height=200&width=400&query=product image placeholder"}
        alt={product.name}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
              {product.description || "No description provided."}
            </p>
          </div>
          <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span key={t} className="rounded-md border border-border px-2 py-0.5 text-xs">
                {t}
              </span>
            ))}
          </div>
        )}

        {actions ? <div className="mt-4 flex gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
