import DashboardLayout from "@/components/layout/DashboardLayout"

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout userRole="trainer">{children}</DashboardLayout>
}
