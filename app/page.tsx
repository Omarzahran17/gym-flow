import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dumbbell, ArrowRight, Check, Zap, Users, Calendar, CreditCard, TrendingUp, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900">GymFlow</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-600 hover:text-zinc-900">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white border border-zinc-200 rounded-full px-4 py-1.5 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-zinc-600">Now with AI-powered workout suggestions</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-6">
              The complete
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                gym management
              </span>
              <br />
              platform
            </h1>
            
            <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto">
              Streamline your fitness business with powerful tools for member management, 
              class scheduling, payments, and progress tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 border-zinc-300 rounded-lg">
                  View demo
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 to-transparent z-10 pointer-events-none" />
            <div className="relative bg-zinc-900 rounded-2xl p-2 shadow-2xl">
              <div className="bg-zinc-800 rounded-xl p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Members", icon: <Users className="h-5 w-5 text-blue-400" /> },
                    { label: "Revenue", icon: <CreditCard className="h-5 w-5 text-green-400" /> },
                    { label: "Classes", icon: <Calendar className="h-5 w-5 text-purple-400" /> },
                    { label: "Retention", icon: <TrendingUp className="h-5 w-5 text-orange-400" /> },
                  ].map((stat, i) => (
                    <div key={i} className="bg-zinc-700/50 rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">{stat.icon}</div>
                      <p className="text-xs text-zinc-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="h-48 bg-zinc-700/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-24 w-24 text-zinc-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-zinc-900 mb-4">
              Everything you need to run your gym
            </h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Powerful features designed to help fitness businesses grow and succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-6 w-6" />,
                title: "Member Management",
                description: "Track member profiles, subscriptions, and attendance in one place.",
                color: "bg-blue-500/10 text-blue-600",
              },
              {
                icon: <Calendar className="h-6 w-6" />,
                title: "Class Scheduling",
                description: "Schedule classes, manage capacity, and handle bookings effortlessly.",
                color: "bg-purple-500/10 text-purple-600",
              },
              {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Progress Tracking",
                description: "Monitor member progress with photos, measurements, and achievements.",
                color: "bg-green-500/10 text-green-600",
              },
              {
                icon: <CreditCard className="h-6 w-6" />,
                title: "Payment Processing",
                description: "Integrated Stripe billing for subscriptions and one-time payments.",
                color: "bg-orange-500/10 text-orange-600",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Analytics & Reports",
                description: "Detailed reports on revenue, attendance, and member engagement.",
                color: "bg-pink-500/10 text-pink-600",
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Trainer Tools",
                description: "Equip trainers with workout planners and exercise libraries.",
                color: "bg-yellow-500/10 text-yellow-600",
              },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-3">{feature.title}</h3>
                <p className="text-zinc-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-950 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 50%)`,
              }} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to transform your gym?
              </h2>
              <p className="text-xl text-zinc-400 mb-8">
                Join thousands of fitness businesses using GymFlow.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg">
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-zinc-900">GymFlow</span>
            </div>
            
            <p className="text-sm text-zinc-500">
              &copy; 2026 GymFlow. All rights reserved.
            </p>

            <div className="flex items-center space-x-6">
              <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900">
                Terms
              </Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
