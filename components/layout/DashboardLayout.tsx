"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dumbbell, Users, Calendar, Settings, LogOut, LayoutDashboard, CreditCard } from "lucide-react"
import { authClient } from "@/lib/auth-client"

interface User {
  id: string
  email: string
  name: string
  role?: string
  image?: string | null
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: "admin" | "trainer" | "member"
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch current user
    authClient.getSession()
      .then(({ data }) => {
        if (data?.user) {
          const userData = data.user as unknown as User
          setUser(userData)
          // Check if user has access to this route
          if (userRole === "admin" && userData.role !== "admin") {
            router.push("/member")
          } else if (userRole === "trainer" && !["admin", "trainer"].includes(userData.role || "")) {
            router.push("/member")
          }
        } else {
          router.push("/login")
        }
        setLoading(false)
      })
      .catch(() => {
        router.push("/login")
        setLoading(false)
      })
  }, [router, userRole])

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  const getNavItems = () => {
    switch (userRole) {
      case "admin":
        return [
          { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { href: "/admin/members", label: "Members", icon: Users },
          { href: "/admin/trainers", label: "Trainers", icon: Users },
          { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
          { href: "/admin/classes", label: "Classes", icon: Calendar },
          { href: "/admin/equipment", label: "Equipment", icon: Dumbbell },
          { href: "/admin/reports", label: "Reports", icon: LayoutDashboard },
        ]
      case "trainer":
        return [
          { href: "/trainer", label: "Dashboard", icon: LayoutDashboard },
          { href: "/trainer/members", label: "My Members", icon: Users },
          { href: "/trainer/workout-plans", label: "Workout Plans", icon: Dumbbell },
          { href: "/trainer/exercises", label: "Exercises", icon: Dumbbell },
          { href: "/trainer/schedule", label: "Schedule", icon: Calendar },
        ]
      case "member":
        return [
          { href: "/member", label: "Dashboard", icon: LayoutDashboard },
          { href: "/member/subscription", label: "Subscription", icon: CreditCard },
          { href: "/member/workout-plan", label: "Workout Plan", icon: Dumbbell },
          { href: "/member/progress", label: "Progress", icon: LayoutDashboard },
          { href: "/member/classes", label: "Classes", icon: Calendar },
        ]
      default:
        return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Gym Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{user?.name || user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold">Gym Admin</span>
            </Link>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
