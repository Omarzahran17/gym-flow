import DashboardLayout from "@/components/layout/DashboardLayout"

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout userRole="member">{children}</DashboardLayout>
}
