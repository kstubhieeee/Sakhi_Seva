"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"

type Product = {
  _id?: string
  id?: string
  name: string
  price: number
  description?: string
  image?: string
  tags?: string[]
  sellerName?: string
  sellerEmail?: string
  createdAt?: string
}

export function ProductCard({ product, actions }: { product: Product; actions?: React.ReactNode }) {
  const productId = product._id || product.id
  const isClickable = !actions && productId // Only clickable if no actions (not in edit mode)

  const CardContent = (
    <div className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full">
        <Image
          src={product.image || "/placeholder.svg?height=200&width=400&query=product image placeholder"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
              {product.description || "No description provided."}
            </p>
            {product.sellerName && (
              <p className="text-xs text-muted-foreground mt-2">
                by {product.sellerName}
              </p>
            )}
          </div>
          <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground whitespace-nowrap">
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

  if (isClickable) {
    return (
      <Link href={`/marketplace/product/${productId}`} className="block">
        {CardContent}
      </Link>
    )
  }

  return CardContent
}
