"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, Plus, Edit, Trash2, Clock } from "lucide-react"
import { createActor, handleCanisterCall } from "@/lib/icp-agent"
import type { Message } from "@/lib/types"

interface MessageManagerProps {
  isConnected: boolean
  userPrincipal: string
}

export function MessageManager({ isConnected, userPrincipal }: MessageManagerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [editingId, setEditingId] = useState<bigint | null>(null)
  const [editContent, setEditContent] = useState("")

  const loadMessages = async () => {
    if (!isConnected) return

    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await handleCanisterCall(() => actor.get_all_messages())

      if (result.success && result.data) {
        setMessages(result.data)
      } else {
        console.error("Failed to load messages:", result.error)
        setMessages([])
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  const createMessage = async () => {
    if (!newMessage.trim() || !isConnected) return

    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await handleCanisterCall(() => actor.create_message(newMessage, userPrincipal))

      if (result.success) {
        setNewMessage("")
        await loadMessages()
      } else {
        console.error("Failed to create message:", result.error)
      }
    } catch (error) {
      console.error("Failed to create message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateMessage = async (id: bigint) => {
    if (!editContent.trim()) return

    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await handleCanisterCall(() => actor.update_message(id, editContent))

      if (result.success && result.data) {
        setEditingId(null)
        setEditContent("")
        await loadMessages()
      } else {
        console.error("Failed to update message:", result.error)
      }
    } catch (error) {
      console.error("Failed to update message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMessage = async (id: bigint) => {
    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await handleCanisterCall(() => actor.delete_message(id))

      if (result.success && result.data) {
        await loadMessages()
      } else {
        console.error("Failed to delete message:", result.error)
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000)
    return date.toLocaleString()
  }

  useEffect(() => {
    if (isConnected) {
      loadMessages()
    }
  }, [isConnected])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Message Manager
        </CardTitle>
        <CardDescription>Create, edit, and manage messages stored in the canister</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Message */}
        <div className="space-y-2">
          <Label htmlFor="new-message">Create New Message</Label>
          <div className="flex gap-2">
            <Textarea
              id="new-message"
              placeholder="Enter your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isConnected || isLoading}
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={createMessage} disabled={!isConnected || !newMessage.trim() || isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create Message
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Messages ({messages.length})</Label>
            <Button variant="outline" size="sm" onClick={loadMessages} disabled={!isConnected || isLoading}>
              Refresh
            </Button>
          </div>

          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No messages found. Create your first message above!</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id.toString()} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={message.author === "system" ? "secondary" : "default"}>
                        {message.author === "system" ? "System" : "User"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(message.id)
                          setEditContent(message.content)
                        }}
                        disabled={isLoading}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMessage(message.id)} disabled={isLoading}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {editingId === message.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateMessage(message.id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setEditContent("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
