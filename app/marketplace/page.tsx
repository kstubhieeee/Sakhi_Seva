"use client"

import { SiteHeader } from "@/components/site-header"
import { ProductCard } from "@/components/marketplace/product-card"
import { ProductForm, type ProductInput } from "@/components/marketplace/product-form"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type Product = {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  tags?: string[]
}

const BROWSE_PRODUCTS: Product[] = [
  {
    id: "b1",
    name: "Handloom Paithani Saree",
    price: 12000,
    description: "Traditional Paithani weave from Maharashtra artisans.",
    tags: ["handloom", "saree", "artisan"],
    image: "/paithani-saree-product.jpg",
  },
  {
    id: "b2",
    name: "Homemade Mango Pickle",
    price: 250,
    description: "Sun-dried, homemade, authentic taste.",
    tags: ["pickle", "homemade", "food"],
    image: "/mango-pickle-jar.png",
  },
  {
    id: "b3",
    name: "Warli Art Canvas",
    price: 1800,
    description: "Hand-painted Warli tribal art on canvas.",
    tags: ["art", "handmade", "warli"],
    image: "/warli-art-canvas.jpg",
  },
]

const STORAGE_KEY = "sakhi-products"

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"browse" | "mine">("browse")
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setMyProducts(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(myProducts))
    } catch {}
  }, [myProducts])

  const editingProduct = useMemo(() => myProducts.find((p) => p.id === editingId), [editingId, myProducts])

  function addProduct(input: ProductInput) {
    const tags = (input.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: input.name,
      price: Number(input.price || 0),
      description: input.description,
      image: input.image,
      tags,
    }
    setMyProducts((prev) => [newProduct, ...prev])
    setActiveTab("mine")
  }

  function updateProduct(input: ProductInput) {
    if (!editingId) return
    const tags = (input.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    setMyProducts((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: input.name,
              price: Number(input.price || 0),
              description: input.description,
              image: input.image,
              tags,
            }
          : p,
      ),
    )
    setEditingId(null)
  }

  function removeProduct(id: string) {
    setMyProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Marketplace</h1>
          <p className="text-sm text-foreground/70 mt-1">Browse community products or manage your own listings.</p>
        </header>

        {/* Tabs (custom segmented control) */}
        <div className="mb-6 inline-flex rounded-md border border-border p-1">
          <button
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              activeTab === "browse"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => setActiveTab("browse")}
          >
            Browse
          </button>
          <button
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              activeTab === "mine"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
            onClick={() => setActiveTab("mine")}
          >
            My products
          </button>
        </div>

        {activeTab === "browse" ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BROWSE_PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-medium">Add a new product</h2>
              <p className="text-sm text-foreground/70 mt-1">Share your craft with the community.</p>
              <div className="mt-4">
                <ProductForm onSubmit={addProduct} submitLabel="Add product" />
              </div>
            </div>

            <div>
              <h2 className="font-medium">Your listings</h2>
              <p className="text-sm text-foreground/70 mt-1">Edit or remove your products below.</p>

              <div className="mt-4 grid gap-4">
                {myProducts.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-5 text-sm text-foreground/70">
                    You haven&apos;t added any products yet.
                  </div>
                ) : (
                  myProducts.map((p) =>
                    editingId === p.id ? (
                      <div key={p.id} className="rounded-lg border border-border bg-card p-5">
                        <h3 className="mb-3 font-medium">Edit: {p.name}</h3>
                        <ProductForm
                          defaultValue={{
                            name: p.name,
                            price: p.price,
                            description: p.description,
                            image: p.image,
                            tags: (p.tags || []).join(", "),
                          }}
                          onSubmit={updateProduct}
                          submitLabel="Save changes"
                        />
                        <div className="mt-3">
                          <button className="text-sm underline underline-offset-4" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <ProductCard
                        key={p.id}
                        product={p}
                        actions={
                          <>
                            <button
                              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                              onClick={() => setEditingId(p.id)}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-md bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20"
                              onClick={() => removeProduct(p.id)}
                            >
                              Delete
                            </button>
                          </>
                        }
                      />
                    ),
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
