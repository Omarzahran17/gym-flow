"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Mail, MessageSquare, Check, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"

interface ContactMessage {
  id: number
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/admin/contact-messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "read" }),
      })
      fetchMessages()
    } catch (err) {
      console.error("Failed to update message:", err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this message?")) return
    try {
      await fetch(`/api/admin/contact-messages/${id}`, {
        method: "DELETE",
      })
      setSelectedMessage(null)
      fetchMessages()
    } catch (err) {
      console.error("Failed to delete message:", err)
    }
  }

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      msg.message.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "read":
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground dark:text-white">Contact Messages</h1>
        <p className="text-muted-foreground dark:text-muted-foreground mt-1">View messages from the contact form</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground dark:text-white">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">New</p>
                <p className="text-2xl font-bold text-blue-600">{messages.filter(m => m.status === "new").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-emerald-600">{messages.filter(m => m.status === "read").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700"
                />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border dark:border-zinc-800 shadow-sm bg-card animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                      <div className="flex-1">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-32 mb-2" />
                        <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-48" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <Card className="mt-4 border-border dark:border-zinc-800 shadow-sm bg-card">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground dark:text-muted-foreground">No messages found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredMessages.map((msg) => (
                <Card
                  key={msg.id}
                  className={`border-border dark:border-zinc-800 shadow-sm bg-card hover:shadow-md transition-shadow cursor-pointer ${
                    selectedMessage?.id === msg.id ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3" onClick={() => setSelectedMessage(msg)}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {msg.name[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground dark:text-white truncate">{msg.name}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(msg.status)}`}>
                              {msg.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground truncate">{msg.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.status === "new" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(msg.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(msg.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedMessage ? (
            <Card className="border-border dark:border-zinc-800 shadow-sm bg-card sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedMessage.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground dark:text-white">{selectedMessage.name}</p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Message</p>
                    <p className="mt-1 text-foreground dark:text-white whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  <div className="pt-3 border-t border-border dark:border-zinc-800">
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      Received: {format(new Date(selectedMessage.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Contact from GymFlow`}
                    className="flex-1"
                  >
                    <Button className="w-full" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </a>
                  {selectedMessage.status === "new" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground dark:text-muted-foreground">Select a message to view</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
