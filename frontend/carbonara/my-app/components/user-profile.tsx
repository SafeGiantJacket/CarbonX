"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Save, UserCheck } from "lucide-react"
import { createActor, handleCanisterCall } from "@/lib/icp-agent"
import type { UserProfile } from "@/lib/types"

interface UserProfileProps {
  isConnected: boolean
  userPrincipal: string
}

export function UserProfileComponent({ isConnected, userPrincipal }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState("")

  const loadProfile = async () => {
    if (!isConnected || !userPrincipal) return

    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await handleCanisterCall(() => actor.get_user_profile(userPrincipal))

      if (result.success && result.data) {
        setProfile(result.data)
        setDisplayName(result.data.name || "")
      } else {
        setProfile(null)
        setDisplayName("")
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const createProfile = async () => {
    if (!isConnected || !userPrincipal) return

    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await handleCanisterCall(() => actor.create_user_profile(userPrincipal, displayName || undefined))

      if (result.success && result.data) {
        await loadProfile()
        setIsEditing(false)
      } else {
        console.error("Failed to create profile:", result.error)
      }
    } catch (error) {
      console.error("Failed to create profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!isConnected || !profile) return

    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await handleCanisterCall(() => actor.update_user_profile(userPrincipal, displayName || undefined))

      if (result.success && result.data) {
        await loadProfile()
        setIsEditing(false)
      } else {
        console.error("Failed to update profile:", result.error)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000)
    return date.toLocaleDateString()
  }

  useEffect(() => {
    if (isConnected && userPrincipal) {
      loadProfile()
    }
  }, [isConnected, userPrincipal])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>Manage your profile information stored in the canister</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-4 text-gray-500">Connect your wallet to view profile</div>
        ) : isLoading && !profile ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading profile...
          </div>
        ) : !profile ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">No profile found. Create one to get started!</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name (Optional)</Label>
              <Input
                id="display-name"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button onClick={createProfile} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Create Profile
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Profile Active
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={isLoading}>
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Principal ID</Label>
                <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1 break-all">
                  {profile.principal}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Display Name</Label>
                {isEditing ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    disabled={isLoading}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{profile.name || "Not set"}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                  {formatTimestamp(profile.created_at)}
                </p>
              </div>

              {isEditing && (
                <Button onClick={updateProfile} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
