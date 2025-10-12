"use client"

import { useEffect, useMemo, useState } from "react"

type Video = {
  id: string
  title: string
  url: string
  duration: string
}

const DEFAULT_VIDEOS: Video[] = [
  {
    id: "vid1",
    title: "Smartphone Basics in Marathi",
    url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    duration: "6:12",
  },
  {
    id: "vid2",
    title: "UPI Payments — Quick Start",
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    duration: "4:03",
  },
  {
    id: "vid3",
    title: "Product Photos with Phone",
    url: "https://www.youtube.com/watch?v=lTTajzrSkCw",
    duration: "7:45",
  },
  {
    id: "vid4",
    title: "List & Price Your Products",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    duration: "5:10",
  },
]

const STORAGE_KEY = "sakhi-training-progress"

export function TrainingList() {
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setProgress(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {}
  }, [progress])

  const completedCount = useMemo(() => Object.values(progress).filter(Boolean).length, [progress])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Your progress</h2>
            <p className="text-sm text-foreground/70">
              {completedCount}/{DEFAULT_VIDEOS.length} completed
            </p>
          </div>
          <button
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => setProgress({})}
            aria-label="Reset progress"
          >
            Reset
          </button>
        </div>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {DEFAULT_VIDEOS.map((v) => {
          const done = !!progress[v.id]
          return (
            <li key={v.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline decoration-dotted underline-offset-4"
                  >
                    {v.title}
                  </a>
                  <p className="text-sm text-foreground/70 mt-1">Duration: {v.duration}</p>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={done}
                    onChange={(e) => setProgress((prev) => ({ ...prev, [v.id]: e.target.checked }))}
                    aria-label={done ? "Mark incomplete" : "Mark complete"}
                  />
                  {done ? "Completed" : "Mark complete"}
                </label>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
