"use client"

import type React from "react"

import { useEffect, useState } from "react"

export type ProductInput = {
  name: string
  price: number | ""
  description?: string
  image?: string
  tags?: string
}

export function ProductForm({
  defaultValue,
  onSubmit,
  submitLabel = "Add product",
  disabled = false,
}: {
  defaultValue?: ProductInput
  onSubmit: (value: ProductInput) => void
  submitLabel?: string
  disabled?: boolean
}) {
  const [form, setForm] = useState<ProductInput>({
    name: "",
    price: "",
    description: "",
    image: "",
    tags: "",
  })

  useEffect(() => {
    if (defaultValue) setForm(defaultValue)
  }, [defaultValue])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim() && form.price !== "") {
      onSubmit(form)
      setForm({ name: "", price: "", description: "", image: "", tags: "" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Product name
          </label>
          <input
            id="name"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
            placeholder="e.g., Handloom Saree"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            disabled={disabled}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Price (₹)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
            placeholder="1500"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value === "" ? "" : Number(e.target.value) }))}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="image" className="text-sm font-medium">
          Image URL
        </label>
        <input
          id="image"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
          placeholder="https://..."
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          disabled={disabled}
        />
        <p className="text-xs text-foreground/60">If empty, a placeholder image will be used.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-medium">
          Tags (comma separated)
        </label>
        <input
          id="tags"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
          placeholder="handloom, cotton, saree"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          className="min-h-[96px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
          placeholder="Tell buyers about your product..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          disabled={disabled}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          disabled={disabled}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
