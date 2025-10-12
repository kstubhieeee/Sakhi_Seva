"use client"

import type React from "react"

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [age, setAge] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { signup } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signup(
      fullName,
      email,
      parseInt(age),
      phoneNumber,
      password
    )

    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Signup failed")
    }
    
    setLoading(false)
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-foreground/70">Join Sakhi-Seva to start your journey.</p>

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min="13"
              max="120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </Button>

          <p className="text-center text-sm text-foreground/70">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Log in
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}
