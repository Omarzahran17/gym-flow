"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Dumbbell, Users, Calendar, Settings, LogOut, LayoutDashboard, CreditCard,
  ChevronLeft, ChevronRight, Menu, X, BarChart3, Trophy, Target, Zap,
  ClipboardList, UserCheck, FileText, Wrench
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="h-12 w-12 rounded-full border-4 border-zinc-200"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-zinc-500 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const navItems = getNavItems()
  const userInitials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || user?.email?.[0]?.toUpperCase()

  const SidebarContent = () => (
    <>
      <div className={`p-4 border-b border-zinc-100 ${collapsed ? "px-3" : ""}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold text-zinc-900">GymFlow</span>
              <p className="text-xs text-zinc-400 capitalize">{userRole} portal</p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className={isActive ? "text-white" : "text-zinc-400"}>
                {iconMap[item.icon]}
              </span>
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`p-3 border-t border-zinc-100 ${collapsed ? "px-2" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 p-2 mb-2 rounded-lg bg-zinc-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-zinc-900 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="flex justify-center mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">{userInitials}</span>
            </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          className={`w-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 ${collapsed ? "px-2" : ""}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transform transition-transform duration-200 md:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900">GymFlow</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-zinc-200 transition-all duration-200 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}>
        <SidebarContent />
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center shadow-sm hover:bg-zinc-50 transition-colors hidden md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-zinc-400" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-zinc-400" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-zinc-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900">GymFlow</span>
            </Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">{userInitials}</span>
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
