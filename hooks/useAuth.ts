"use client"

import { useEffect, useState } from "react"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const signOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" })
    setUser(null)
  }

  return { user, loading, signOut }
}

export function useMembers() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/admin/members")
      const data = await res.json()
      setMembers(data.members || [])
    } catch (err) {
      setError("Failed to fetch members")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const createMember = async (memberData: any) => {
    const res = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberData),
    })
    return res.json()
  }

  const updateMember = async (id: number, memberData: any) => {
    const res = await fetch(`/api/admin/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberData),
    })
    return res.json()
  }

  return { members, loading, error, createMember, updateMember, refresh: fetchMembers }
}

export function useTrainers() {
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/trainers")
      .then((res) => res.json())
      .then((data) => {
        setTrainers(data.trainers || [])
      })
      .catch((err) => console.error("Failed to fetch trainers:", err))
      .finally(() => setLoading(false))
  }, [])

  return { trainers, loading }
}
