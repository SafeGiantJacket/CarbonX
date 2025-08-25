"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardScreenProps {
  actor: any
  currentPrincipal: string
}

interface DashboardStats {
  totalBatches: number
  totalSupply: bigint
  totalHoldings: bigint
  activeListings: number
  totalRetired: bigint
  portfolioValue: number
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ actor, currentPrincipal }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    totalSupply: BigInt(0),
    totalHoldings: BigInt(0),
    activeListings: 0,
    totalRetired: BigInt(0),
    portfolioValue: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [batches, holdings, listings, retirements, auditLog] = await Promise.all([
        actor.listBatches(),
        actor.myHoldings([]),
        actor.listOpenListings(),
        actor.myRetirements([]),
        actor.auditLog([]),
      ])

      const totalSupply = batches.reduce((sum: bigint, batch: any) => sum + batch.totalSupply, BigInt(0))
      const totalHoldings = holdings.reduce((sum: bigint, holding: any) => sum + holding.amount, BigInt(0))
      const totalRetired = retirements.reduce((sum: bigint, retirement: any) => sum + retirement.amount, BigInt(0))

      setStats({
        totalBatches: batches.length,
        totalSupply,
        totalHoldings,
        activeListings: listings.length,
        totalRetired,
        portfolioValue: Number(totalHoldings) * 12.5, // Estimated value at $12.5/ton
      })

      // Get recent activity (last 10 events)
      setRecentActivity(auditLog.slice(-10).reverse())
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [actor])

  const formatAmount = (amount: bigint) => {
    return Number(amount).toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "issuebatch":
        return "🌱"
      case "transfer":
        return "↔️"
      case "createlisting":
        return "🏪"
      case "buy":
        return "💰"
      case "retire":
        return "🌍"
      case "verifybatch":
        return "✅"
      default:
        return "📝"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Welcome to CarbonX</h1>
        <p className="text-primary-foreground/90">
          Your comprehensive carbon credit trading dashboard. Monitor your portfolio, track market activity, and manage
          your environmental impact.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{formatAmount(stats.totalHoldings)}</div>
            <p className="text-xs text-muted-foreground">tons CO₂ equivalent</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{formatCurrency(stats.portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">estimated market value</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{stats.totalBatches}</div>
            <p className="text-xs text-muted-foreground">credit batches issued</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retired Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatAmount(stats.totalRetired)}</div>
            <p className="text-xs text-muted-foreground">tons CO₂ offset</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>Market Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Total Supply</p>
                <p className="text-xs text-muted-foreground">All issued credits</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatAmount(stats.totalSupply)}</p>
                <p className="text-xs text-muted-foreground">tons CO₂</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Active Listings</p>
                <p className="text-xs text-muted-foreground">Available for trading</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{stats.activeListings}</p>
                <p className="text-xs text-muted-foreground">listings</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Average Price</p>
                <p className="text-xs text-muted-foreground">Market estimate</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">$12.50</p>
                <p className="text-xs text-muted-foreground">per ton CO₂</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentActivity.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <span className="text-lg">{getActivityIcon(event.action)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {event.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(Number(event.tsNs) / 1000000).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1 truncate">{event.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-center">
              <div className="text-2xl mb-2">🌱</div>
              <div className="text-sm font-medium">Issue Batch</div>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-center">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm font-medium">Create Listing</div>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-center">
              <div className="text-2xl mb-2">🌍</div>
              <div className="text-sm font-medium">Retire Credits</div>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">View Analytics</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
