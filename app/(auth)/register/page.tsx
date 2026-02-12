"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { Dumbbell, ArrowRight, Check, LayoutDashboard } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession()
        if (data?.user) {
          setIsLoggedIn(true)
        }
      } catch (e) {
        // Not logged in
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      }, {
        onRequest: () => {
          setLoading(true)
        },
        onSuccess: () => {
          router.push("/login?registered=true")
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to create account")
        },
      })

      if (error) {
        setError(error.message || "Failed to create account")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const password = formData.password
    if (password.length < 8) return { strength: 0, label: "Too short", color: "bg-red-500" }
    if (!/[A-Z]/.test(password)) return { strength: 25, label: "Add uppercase", color: "bg-yellow-500" }
    if (!/[0-9]/.test(password)) return { strength: 50, label: "Add number", color: "bg-yellow-500" }
    if (!/[!@#$%^&*]/.test(password)) return { strength: 75, label: "Add special char", color: "bg-blue-500" }
    return { strength: 100, label: "Strong", color: "bg-green-500" }
  }

  const strength = passwordStrength()

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white flex-col justify-center px-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
            }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">GymFlow</span>
            </div>

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Welcome back!
            </h1>

            <p className="text-zinc-400 text-lg max-w-md">
              You are already signed in. Go to your dashboard to continue.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-zinc-900">
          <div className="w-full max-w-md text-center">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">GymFlow</span>
            </div>

            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <LayoutDashboard className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">You&apos;re already signed in</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">Go to your dashboard to manage your account</p>

            <div className="space-y-3">
              <Link href="/admin" className="block">
                <Button className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/member" className="block">
                <Button variant="outline" className="w-full h-11 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-lg transition-colors">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Member Dashboard
                </Button>
              </Link>
              <Link href="/trainer" className="block">
                <Button variant="outline" className="w-full h-11 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-medium rounded-lg transition-colors">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Trainer Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">GymFlow</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900">Create your account</h2>
            <p className="text-zinc-500 mt-2">Start your fitness journey today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-zinc-700">
                  First name
                </label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-11 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-zinc-700">
                  Last name
                </label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-11 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-zinc-700">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
                required
              />
              {formData.password && (
                <div className="space-y-1">
                  <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.strength}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-11 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 transition-colors"
                required
              />
            </div>

            <div className="flex items-start space-x-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                required
              />
              <label htmlFor="terms" className="text-sm text-zinc-500">
                I agree to the{" "}
                <Link href="/terms" className="text-zinc-900 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-zinc-900 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors mt-6"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-zinc-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-900 hover:text-zinc-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white flex-col justify-center px-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">GymFlow</span>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Everything you need<br />
            <span className="text-zinc-400">to crush your goals.</span>
          </h1>

          <div className="space-y-4">
            {[
              "Personalized workout plans",
              "Track your progress",
              "Book classes and sessions",
              "Nutrition guidance",
            ].map((feature, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <p className="text-zinc-300 italic">
              "GymFlow has transformed how we manage our fitness studio. It's intuitive,
              powerful, and our members love it."
            </p>
            <div className="mt-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
              <div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-sm text-zinc-500">Fitness Studio Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
