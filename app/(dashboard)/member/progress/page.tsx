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
  ChevronRight
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="measurements">
            <TrendingUp className="h-4 w-4 mr-2" />
            Measurements
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
            <Button>
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>

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
