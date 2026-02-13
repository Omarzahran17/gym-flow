"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dumbbell, Users, Calendar, Settings, LogOut, LayoutDashboard, CreditCard,
  ChevronLeft, ChevronRight, Menu, X, BarChart3, Trophy, Target, Zap,
  ClipboardList, UserCheck, FileText, Wrench, Sun, Moon, MessageSquare, Sparkles
} from "lucide-react"
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

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  ClipboardList: <ClipboardList className="h-5 w-5" />,
  UserCheck: <UserCheck className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Wrench: <Wrench className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    authClient.getSession()
      .then(({ data }) => {
        if (data?.user) {
          const userData = data.user as unknown as User
          setUser(userData)
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

  const getDashboardUrl = () => {
    switch (user?.role) {
      case "admin":
        return "/admin"
      case "trainer":
        return "/trainer"
      default:
        return "/member"
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getNavItems = () => {
    switch (userRole) {
      case "admin":
        return [
          { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
          { href: "/admin/members", label: "Members", icon: "Users" },
          { href: "/admin/trainers", label: "Trainers", icon: "UserCheck" },
          { href: "/admin/classes", label: "Classes", icon: "Calendar" },
          { href: "/admin/subscriptions", label: "Subscriptions", icon: "CreditCard" },
          { href: "/admin/equipment", label: "Equipment", icon: "Wrench" },
          { href: "/admin/check-in", label: "Check-In", icon: "ClipboardList" },
          { href: "/admin/reports", label: "Reports", icon: "BarChart3" },
          { href: "/admin/contact", label: "Contact Messages", icon: "MessageSquare" },
        ]
      case "trainer":
        return [
          { href: "/trainer", label: "Dashboard", icon: "LayoutDashboard" },
          { href: "/trainer/members", label: "My Members", icon: "Users" },
          { href: "/trainer/workout-plans", label: "Workout Plans", icon: "ClipboardList" },
          { href: "/trainer/exercises", label: "Exercises", icon: "Dumbbell" },
          { href: "/trainer/schedule", label: "Schedule", icon: "Calendar" },
        ]
      case "member":
        return [
          { href: "/member", label: "Dashboard", icon: "LayoutDashboard" },
          { href: "/member/chat", label: "AI Coach", icon: "Sparkles" },
          { href: "/member/workout-plan", label: "Workout Plan", icon: "Dumbbell" },
          { href: "/member/classes", label: "Classes", icon: "Calendar" },
          { href: "/member/progress", label: "Progress", icon: "Target" },
          { href: "/member/subscription", label: "Subscription", icon: "CreditCard" },
        ]
      default:
        return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="h-12 w-12 rounded-full border-4 border-muted"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const navItems = getNavItems()
  const userInitials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || user?.email?.[0]?.toUpperCase()

  const SidebarContent = () => (
    <>
      <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 ${collapsed ? "px-3" : ""}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">GymFlow</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{userRole} portal</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className={isActive ? "text-white" : ""}>
                {iconMap[item.icon]}
              </span>
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`p-3 border-t border-zinc-200 dark:border-zinc-800 ${collapsed ? "px-2" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
              <span className="text-sm font-bold text-white">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-sm font-bold text-white">{userInitials}</span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white ${collapsed ? "justify-center" : ""}`}
          >
            {mounted && theme === "dark" ? (
              <>
                <Sun className="h-5 w-5 text-amber-500" />
                {!collapsed && <span className="font-medium text-sm">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-indigo-500" />
                {!collapsed && <span className="font-medium text-sm">Dark Mode</span>}
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">GymFlow</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-zinc-500">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}>
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 w-8 h-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200 z-20"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-zinc-500" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="text-zinc-600 dark:text-zinc-400">
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">GymFlow</span>
            </Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-sm font-bold text-white">{userInitials}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
