"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Camera,
  Trophy,
  Plus,
  Calendar,
  Weight,
  Ruler,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Target,
  TrendingDown,
  Minus,
  Trash2
} from "lucide-react"
import { format } from "date-fns"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

interface Measurement {
  id: number
  date: string
  weight: number | null
  bodyFat: number | null
  chest: number | null
  waist: number | null
  hips: number | null
  arms: number | null
  thighs: number | null
  notes: string | null
}

interface PersonalRecord {
  id: number
  date: string
  exerciseName: string
  weight: number | null
  reps: number | null
}

interface ProgressPhoto {
  id: number
  date: string
  url: string
  type: string
  notes: string | null
}

export default function MemberProgressPage() {
  const [activeTab, setActiveTab] = useState("measurements")
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [records, setRecords] = useState<PersonalRecord[]>([])
  const [photos, setPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMeasurement, setShowAddMeasurement] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showAddPhoto, setShowAddPhoto] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [showGoalInput, setShowGoalInput] = useState(false)
  const [goal, setGoal] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/member/measurements").then(r => r.json()),
      fetch("/api/member/personal-records").then(r => r.json()),
      fetch("/api/member/progress-photos").then(r => r.json()),
    ]).then(([measData, recData, photoData]) => {
      if (measData.measurements) setMeasurements(measData.measurements)
      if (recData.records) setRecords(recData.records)
      if (photoData.photos) setPhotos(photoData.photos)
    }).catch(err => console.error("Failed to load progress data:", err))
      .finally(() => setLoading(false))
  }, [])

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true)
    try {
      const response = await fetch("/api/ai/progress-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal || undefined }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate insights")
      }

      const data = await response.json()
      setInsights(data.insights)
    } catch (err: any) {
      console.error("Failed to generate insights:", err)
      alert(err.message || "Failed to generate insights. Make sure you have at least 2 measurements.")
    } finally {
      setGeneratingInsights(false)
    }
  }

  const chartData = measurements
    .slice()
    .reverse()
    .map(m => ({
      date: format(new Date(m.date), "MMM d"),
      weight: m.weight,
      bodyFat: m.bodyFat,
      chest: m.chest,
      waist: m.waist,
    }))

  const latestMeasurement = measurements[0]
  const previousMeasurement = measurements[1]

  const getChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null
    const change = current - previous
    return {
      value: change.toFixed(1),
      isPositive: change > 0,
    }
  }

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm("Are you sure you want to delete this progress photo?")) return
    
    try {
      const response = await fetch(`/api/member/progress-photos?id=${photoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete photo")
      }

      setPhotos(photos.filter(p => p.id !== photoId))
    } catch (err) {
      console.error("Error deleting photo:", err)
      alert("Failed to delete photo. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-gray-500">Loading progress data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-gray-600">Track your fitness journey</p>
        </div>
      </div>

      {/* Stats Overview */}
      {latestMeasurement && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Weight className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-500">Weight</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {latestMeasurement.weight ? `${latestMeasurement.weight} kg` : "-"}
              </p>
              {getChange(latestMeasurement.weight, previousMeasurement?.weight) && (
                <p className={`text-sm ${getChange(latestMeasurement.weight, previousMeasurement?.weight)?.isPositive ? "text-red-500" : "text-green-500"}`}>
                  {getChange(latestMeasurement.weight, previousMeasurement?.weight)?.isPositive ? "+" : ""}
                  {getChange(latestMeasurement.weight, previousMeasurement?.weight)?.value} kg
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">Body Fat</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {latestMeasurement.bodyFat ? `${latestMeasurement.bodyFat}%` : "-"}
              </p>
              {getChange(latestMeasurement.bodyFat, previousMeasurement?.bodyFat) && (
                <p className={`text-sm ${getChange(latestMeasurement.bodyFat, previousMeasurement?.bodyFat)?.isPositive ? "text-red-500" : "text-green-500"}`}>
                  {getChange(latestMeasurement.bodyFat, previousMeasurement?.bodyFat)?.value}%
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-500">PRs</span>
              </div>
              <p className="text-2xl font-bold mt-2">{records.length}</p>
              <p className="text-sm text-gray-500">Personal Records</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-500">Photos</span>
              </div>
              <p className="text-2xl font-bold mt-2">{photos.length}</p>
              <p className="text-sm text-gray-500">Progress Photos</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurements">
            <TrendingUp className="h-4 w-4 mr-2" />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="records">
            <Trophy className="h-4 w-4 mr-2" />
            PRs
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Camera className="h-4 w-4 mr-2" />
            Photos
          </TabsTrigger>
        </TabsList>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-6">
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setShowAddMeasurement(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Measurement
            </Button>
          </div>

          {showAddMeasurement && (
            <AddMeasurementForm
              onClose={() => setShowAddMeasurement(false)}
              onSuccess={() => {
                setShowAddMeasurement(false)
                // Refresh data
                fetch("/api/member/measurements")
                  .then(r => r.json())
                  .then(data => {
                    if (data.measurements) setMeasurements(data.measurements)
                  })
              }}
            />
          )}

          <div className="space-y-4">
            {measurements.map((measurement) => (
              <Card key={measurement.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(new Date(measurement.date), "MMMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {measurement.weight && (
                      <div className="text-center">
                        <p className="text-lg font-semibold">{measurement.weight}</p>
                        <p className="text-xs text-gray-500">kg</p>
                      </div>
                    )}
                    {measurement.bodyFat && (
                      <div className="text-center">
                        <p className="text-lg font-semibold">{measurement.bodyFat}%</p>
                        <p className="text-xs text-gray-500">Body Fat</p>
                      </div>
                    )}
                    {measurement.chest && (
                      <div className="text-center">
                        <p className="text-lg font-semibold">{measurement.chest}</p>
                        <p className="text-xs text-gray-500">Chest</p>
                      </div>
                    )}
                    {measurement.waist && (
                      <div className="text-center">
                        <p className="text-lg font-semibold">{measurement.waist}</p>
                        <p className="text-xs text-gray-500">Waist</p>
                      </div>
                    )}
                    {measurement.hips && (
                      <div className="text-center">
                        <p className="text-lg font-semibold">{measurement.hips}</p>
                        <p className="text-xs text-gray-500">Hips</p>
                      </div>
                    )}
                    {measurement.arms && (
                      <div className="text-center">
                        <p className="text-lg font-semibold">{measurement.arms}</p>
                        <p className="text-xs text-gray-500">Arms</p>
                      </div>
                    )}
                  </div>
                  {measurement.notes && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {measurement.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Progress Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!insights ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Get AI-Powered Insights</p>
                    <p className="text-sm text-gray-500">Analyze your progress trends and get personalized recommendations</p>
                  </div>
                  
                  {showGoalInput ? (
                    <div className="max-w-md mx-auto space-y-3">
                      <Input
                        placeholder="Enter your fitness goal (e.g., lose 10kg, build muscle)"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => setShowGoalInput(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleGenerateInsights} 
                          disabled={generatingInsights || measurements.length < 2}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {generatingInsights ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Insights
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setShowGoalInput(true)} 
                      disabled={measurements.length < 2}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Insights
                    </Button>
                  )}
                  
                  {measurements.length < 2 && (
                    <p className="text-sm text-orange-500">Need at least 2 measurements to generate insights</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Summary</h3>
                    <p className="text-purple-800">{insights.summary}</p>
                  </div>

                  {/* Trends */}
                  {insights.trends && insights.trends.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Progress Trends</h3>
                      <div className="grid gap-3">
                        {insights.trends.map((trend: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {trend.change.includes("-") ? (
                                <TrendingDown className="h-5 w-5 text-green-500" />
                              ) : trend.change.includes("+") ? (
                                <TrendingUp className="h-5 w-5 text-red-500" />
                              ) : (
                                <Minus className="h-5 w-5 text-gray-500" />
                              )}
                              <div>
                                <p className="font-medium">{trend.metric}</p>
                                <p className="text-sm text-gray-500">{trend.interpretation}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${trend.change.includes("-") ? "text-green-600" : trend.change.includes("+") ? "text-red-600" : "text-gray-600"}`}>
                                {trend.change} ({trend.percentage})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goal Prediction */}
                  {insights.goalPrediction && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Goal Prediction
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={insights.goalPrediction.onTrack ? "default" : "destructive"}>
                          {insights.goalPrediction.onTrack ? "On Track" : "Needs Attention"}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Estimated completion: {insights.goalPrediction.estimatedCompletion}
                        </span>
                      </div>
                      {insights.goalPrediction.factors && insights.goalPrediction.factors.length > 0 && (
                        <ul className="text-sm text-gray-600 space-y-1">
                          {insights.goalPrediction.factors.map((factor: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-purple-500">•</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {insights.recommendations && insights.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {insights.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                            <p className="text-blue-800">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center pt-4 border-t">
                    <Button variant="outline" onClick={() => setInsights(null)}>
                      Generate New Insights
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Records Tab */}
        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddRecord(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add PR
            </Button>
          </div>

          {showAddRecord && (
            <AddPersonalRecordForm
              onClose={() => setShowAddRecord(false)}
              onSuccess={() => {
                setShowAddRecord(false)
                fetch("/api/member/personal-records")
                  .then(r => r.json())
                  .then(data => {
                    if (data.records) setRecords(data.records)
                  })
              }}
            />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {records.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{record.exerciseName}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(record.date), "MMMM d, yyyy")}
                      </p>
                    </div>
                    <Dumbbell className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    {record.weight && (
                      <Badge variant="secondary" className="text-lg">
                        {record.weight} kg
                      </Badge>
                    )}
                    {record.reps && (
                      <Badge variant="outline" className="text-lg">
                        {record.reps} reps
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {records.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No personal records yet</p>
              <p className="text-sm text-gray-400">Start tracking your PRs to see progress</p>
            </div>
          )}
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddPhoto(true)}>
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>

          {showAddPhoto && (
            <AddProgressPhotoForm
              onClose={() => setShowAddPhoto(false)}
              onSuccess={() => {
                setShowAddPhoto(false)
                fetch("/api/member/progress-photos")
                  .then(r => r.json())
                  .then(data => {
                    if (data.photos) setPhotos(data.photos)
                  })
              }}
            />
          )}

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <Image
                      src={photo.url}
                      alt={`Progress photo from ${format(new Date(photo.date), "MMM d, yyyy")}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">
                      {format(new Date(photo.date), "MMMM d, yyyy")}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {photo.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No progress photos yet</p>
              <p className="text-sm text-gray-400">Upload photos to track your visual progress</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AddMeasurementForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/member/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to add measurement")
      onSuccess()
    } catch (err) {
      console.error("Error adding measurement:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Measurement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="bodyFat">Body Fat (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                value={formData.bodyFat}
                onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="chest">Chest (cm)</Label>
              <Input
                id="chest"
                type="number"
                step="0.1"
                value={formData.chest}
                onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                value={formData.waist}
                onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="hips">Hips (cm)</Label>
              <Input
                id="hips"
                type="number"
                step="0.1"
                value={formData.hips}
                onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="arms">Arms (cm)</Label>
              <Input
                id="arms"
                type="number"
                step="0.1"
                value={formData.arms}
                onChange={(e) => setFormData({ ...formData, arms: e.target.value })}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="thighs">Thighs (cm)</Label>
              <Input
                id="thighs"
                type="number"
                step="0.1"
                value={formData.thighs}
                onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                placeholder="0.0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How are you feeling? Any observations?"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Measurement"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function AddPersonalRecordForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    exerciseName: "",
    weight: "",
    reps: "",
    date: format(new Date(), "yyyy-MM-dd"),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/member/personal-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to add PR")
      onSuccess()
    } catch (err) {
      console.error("Error adding PR:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Personal Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="exerciseName">Exercise Name *</Label>
            <Input
              id="exerciseName"
              value={formData.exerciseName}
              onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })}
              placeholder="e.g., Bench Press"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pr-weight">Weight (kg)</Label>
              <Input
                id="pr-weight"
                type="number"
                step="0.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="pr-reps">Reps</Label>
              <Input
                id="pr-reps"
                type="number"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pr-date">Date</Label>
            <Input
              id="pr-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save PR"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function AddProgressPhotoForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "Front",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert("Please select an image first")
      return
    }
    setLoading(true)

    try {
      // 1. Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Please upload a JPEG, PNG, WEBP, or GIF image.`)
      }

      // 2. Check file size (10MB limit)
      const maxSizeMB = 10
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        throw new Error(`File too large: ${sizeMB.toFixed(2)}MB. Maximum size is ${maxSizeMB}MB`)
      }

      console.log("Starting upload:", file.name, "size:", sizeMB.toFixed(2), "MB")

      // 3. Upload to Blob storage
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("path", `progress/${Date.now()}-${file.name}`)
      uploadFormData.append("type", "image")

      const uploadRes = await fetch("/api/blob/upload", {
        method: "POST",
        body: uploadFormData,
      })

      console.log("Upload response status:", uploadRes.status)

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        console.error("Upload error details:", errorData)
        throw new Error(errorData.error || `Upload failed with status ${uploadRes.status}`)
      }

      const uploadData = await uploadRes.json()
      console.log("Upload successful, URL:", uploadData.url)

      // 4. Save progress photo record
      const response = await fetch("/api/member/progress-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          url: uploadData.url,
        }),
      })

      console.log("Save photo response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save progress photo")
      }

      console.log("Progress photo saved successfully")
      onSuccess()
    } catch (err) {
      console.error("Error adding progress photo:", err)
      alert(err instanceof Error ? err.message : "Failed to add progress photo. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Upload Progress Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="photo-date">Date</Label>
              <Input
                id="photo-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="photo-type">View Type</Label>
              <select
                id="photo-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="Front">Front View</option>
                <option value="Side">Side View</option>
                <option value="Back">Back View</option>
                <option value="Relaxed">Relaxed</option>
                <option value="Flexed">Flexed</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="photo-file">Select Image</Label>
            <Input
              id="photo-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div>
            <Label htmlFor="photo-notes">Notes (Optional)</Label>
            <Input
              id="photo-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any comments about this photo?"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
