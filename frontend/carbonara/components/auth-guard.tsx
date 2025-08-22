"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { isAuthenticated } from "@/lib/icp-agent"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated()
        setIsAuth(authenticated)
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuth(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Checking authentication...
      </div>
    )
  }

  if (!isAuth) {
    return (
      fallback || (
        <div className="text-center py-8 text-gray-500">
          Please connect your Internet Identity to access this feature.
        </div>
      )
    )
  }

  return <>{children}</>
}
