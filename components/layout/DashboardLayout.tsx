"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dumbbell, Users, Calendar, Settings, LogOut, LayoutDashboard, CreditCard,
  ChevronLeft, ChevronRight, Menu, X, BarChart3, Trophy, Target, Zap,
  ClipboardList, UserCheck, FileText, Wrench, Sun, Moon
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
          { href: "/member/workout-plan", label: "Workout Plan", icon: "Dumbbell" },
          { href: "/member/classes", label: "Classes", icon: "Calendar" },
          { href: "/member/progress", label: "Progress", icon: "Target" },
          { href: "/member/achievements", label: "Achievements", icon: "Trophy" },
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
      <div className={`p-4 border-b border-sidebar-border ${collapsed ? "px-3" : ""}`}>
        <Link href={getDashboardUrl()} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold text-sidebar-foreground">GymFlow</span>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{userRole} portal</p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className={isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60"}>
                {iconMap[item.icon]}
              </span>
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`p-3 border-t border-sidebar-border ${collapsed ? "px-2" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 p-2 mb-2 rounded-lg bg-sidebar-accent/50">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-sidebar-foreground truncate">{user?.name || "User"}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center mb-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{userInitials}</span>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className={`w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 ${collapsed ? "px-2" : ""}`}
          onClick={toggleTheme}
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </Button>

        <Button
          variant="ghost"
          className={`w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 ${collapsed ? "px-2" : ""}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform duration-200 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link href={getDashboardUrl()} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">GymFlow</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 ${collapsed ? "w-[72px]" : "w-64"
        }`}>
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-accent transition-colors hidden md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-background border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Link href={getDashboardUrl()} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">GymFlow</span>
            </Link>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{userInitials}</span>
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
