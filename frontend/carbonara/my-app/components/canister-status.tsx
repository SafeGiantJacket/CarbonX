"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Activity, RefreshCw, MessageSquare, Users, Globe } from "lucide-react"
import { createActor, handleCanisterCall } from "@/lib/icp-agent"
import type { CanisterStatus } from "@/lib/types"

interface CanisterStatusProps {
  isConnected: boolean
}

export function CanisterStatusComponent({ isConnected }: CanisterStatusProps) {
  const [status, setStatus] = useState<CanisterStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadStatus = async () => {
    if (!isConnected) return

    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await handleCanisterCall(() => actor.get_canister_status())

      if (result.success && result.data) {
        setStatus(result.data)
      } else {
        console.error("Failed to load canister status:", result.error)
        setStatus(null)
      }
    } catch (error) {
      console.error("Failed to load canister status:", error)
      setStatus(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected) {
      loadStatus()
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [isConnected])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Canister Status
        </CardTitle>
        <CardDescription>Real-time statistics and information about the canister</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-4 text-gray-500">Connect to view canister status</div>
        ) : isLoading && !status ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading status...
          </div>
        ) : status ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Canister Online
              </Badge>
              <Button variant="outline" size="sm" onClick={loadStatus} disabled={isLoading}>
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Messages</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{status.message_count.toString()}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Users</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{status.user_count.toString()}</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <p className="text-sm font-medium text-purple-600">Active</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Global Message</label>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">{status.global_message}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Failed to load canister status</div>
        )}
      </CardContent>
    </Card>
  )
}
