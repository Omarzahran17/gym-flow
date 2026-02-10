"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Flame, Zap, Award, Lock } from "lucide-react"

interface Achievement {
  id: number
  name: string
  description: string | null
  icon: string | null
  criteriaType: string | null
  criteriaValue: number | null
  points: number
  earned: boolean
  earnedAt: string | null
}

const ICON_MAP: Record<string, React.ReactNode> = {
  star: <Star className="h-8 w-8" />,
  trophy: <Trophy className="h-8 w-8" />,
  target: <Target className="h-8 w-8" />,
  flame: <Flame className="h-8 w-8" />,
  zap: <Zap className="h-8 w-8" />,
  award: <Award className="h-8 w-8" />,
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/member/achievements")
      .then((res) => res.json())
      .then((data) => {
        if (data.achievements) {
          setAchievements(data.achievements)
        }
      })
      .catch((err) => console.error("Failed to fetch achievements:", err))
      .finally(() => setLoading(false))
  }, [])

  const earnedAchievements = achievements.filter((a) => a.earned)
  const lockedAchievements = achievements.filter((a) => !a.earned)
  const totalPoints = earnedAchievements.reduce((acc, a) => acc + (a.points || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-zinc-200"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Achievements</h1>
        <p className="text-zinc-500 mt-1">Track your fitness milestones and earn badges</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">{earnedAchievements.length}</p>
                <p className="text-sm text-zinc-600">Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-100 rounded-xl">
                <Lock className="h-6 w-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">{lockedAchievements.length}</p>
                <p className="text-sm text-zinc-500">Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">{totalPoints}</p>
                <p className="text-sm text-zinc-600">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {earnedAchievements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Earned Achievements
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {earnedAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className="border-amber-200 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50"
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">
                      {achievement.icon || "🏆"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-zinc-900">{achievement.name}</h3>
                  {achievement.description && (
                    <p className="text-sm text-zinc-600 mt-1">{achievement.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      +{achievement.points} points
                    </Badge>
                  </div>
                  {achievement.earnedAt && (
                    <p className="text-xs text-zinc-400 mt-3">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-zinc-400" />
            Locked Achievements
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lockedAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className="border-zinc-200 shadow-sm opacity-60 hover:opacity-80 transition-opacity"
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-zinc-400" />
                  </div>
                  <h3 className="font-semibold text-zinc-700">{achievement.name}</h3>
                  {achievement.description && (
                    <p className="text-sm text-zinc-500 mt-1">{achievement.description}</p>
                  )}
                  {achievement.criteriaValue && (
                    <p className="text-xs text-zinc-400 mt-3">
                      Requires: {achievement.criteriaValue} {achievement.criteriaType}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {achievements.length === 0 && (
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <Trophy className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500">No achievements available</p>
            <p className="text-zinc-400 text-sm mt-1">Start working out to earn achievements!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
