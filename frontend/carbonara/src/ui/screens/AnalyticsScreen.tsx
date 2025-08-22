"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalyticsScreenProps {
  actor: any
  currentPrincipal: string
}

interface AuditEvent {
  tsNs: bigint
  actor: string
  action: string
  details: string
}

interface CreditBatch {
  id: number
  projectId: string
  standard: string
  vintage: number
  totalSupply: bigint
  available: bigint
  metadata: string
  issuer: string
  createdAtNs: bigint
  tags: string[]
  royalty_ppm: number
}

interface AnalyticsData {
  totalBatches: number
  totalSupply: bigint
  totalAvailable: bigint
  totalRetired: bigint
  averageRoyalty: number
  standardDistribution: Record<string, number>
  vintageDistribution: Record<string, number>
  tagDistribution: Record<string, number>
  activityByAction: Record<string, number>
  activityByActor: Record<string, number>
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ actor, currentPrincipal }) => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "batches" | "activity" | "export">("overview")
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
  const [batches, setBatches] = useState<CreditBatch[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBatches: 0,
    totalSupply: BigInt(0),
    totalAvailable: BigInt(0),
    totalRetired: BigInt(0),
    averageRoyalty: 0,
    standardDistribution: {},
    vintageDistribution: {},
    tagDistribution: {},
    activityByAction: {},
    activityByActor: {},
  })
  const [timeFilter, setTimeFilter] = useState("all")
  const [exportFormat, setExportFormat] = useState("csv")

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [auditResult, batchesResult] = await Promise.all([actor.auditLog([]), actor.listBatches()])

      setAuditLog(auditResult)
      setBatches(batchesResult)

      // Calculate analytics
      const totalSupply = batchesResult.reduce((sum: bigint, batch: CreditBatch) => sum + batch.totalSupply, BigInt(0))
      const totalAvailable = batchesResult.reduce((sum: bigint, batch: CreditBatch) => sum + batch.available, BigInt(0))
      const totalRetired = totalSupply - totalAvailable

      // Standard distribution
      const standardDist: Record<string, number> = {}
      batchesResult.forEach((batch: CreditBatch) => {
        standardDist[batch.standard] = (standardDist[batch.standard] || 0) + 1
      })

      // Vintage distribution
      const vintageDist: Record<string, number> = {}
      batchesResult.forEach((batch: CreditBatch) => {
        const vintage = batch.vintage.toString()
        vintageDist[vintage] = (vintageDist[vintage] || 0) + 1
      })

      // Tag distribution
      const tagDist: Record<string, number> = {}
      batchesResult.forEach((batch: CreditBatch) => {
        batch.tags.forEach((tag: string) => {
          tagDist[tag] = (tagDist[tag] || 0) + 1
        })
      })

      // Activity by action
      const actionDist: Record<string, number> = {}
      auditResult.forEach((event: AuditEvent) => {
        actionDist[event.action] = (actionDist[event.action] || 0) + 1
      })

      // Activity by actor
      const actorDist: Record<string, number> = {}
      auditResult.forEach((event: AuditEvent) => {
        const shortActor = `${event.actor.slice(0, 8)}...${event.actor.slice(-4)}`
        actorDist[shortActor] = (actorDist[shortActor] || 0) + 1
      })

      // Average royalty
      const avgRoyalty =
        batchesResult.length > 0
          ? batchesResult.reduce((sum: number, batch: CreditBatch) => sum + Number(batch.royalty_ppm), 0) /
            batchesResult.length
          : 0

      setAnalytics({
        totalBatches: batchesResult.length,
        totalSupply,
        totalAvailable,
        totalRetired,
        averageRoyalty: avgRoyalty,
        standardDistribution: standardDist,
        vintageDistribution: vintageDist,
        tagDistribution: tagDist,
        activityByAction: actionDist,
        activityByActor: actorDist,
      })
    } catch (error) {
      console.error("Failed to load analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [actor])

  const formatAmount = (amount: bigint) => Number(amount).toLocaleString()
  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleDateString()
  }

  const exportData = () => {
    if (exportFormat === "csv") {
      const csvContent = [
        "Timestamp,Actor,Action,Details",
        ...auditLog.map(
          (event) =>
            `"${formatDate(event.tsNs)}","${event.actor}","${event.action}","${event.details.replace(/"/g, '""')}"`,
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `carbon-ledger-analytics-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      const jsonData = {
        analytics,
        batches: batches.map((batch) => ({
          ...batch,
          totalSupply: batch.totalSupply.toString(),
          available: batch.available.toString(),
          createdAtNs: batch.createdAtNs.toString(),
        })),
        auditLog: auditLog.map((event) => ({
          ...event,
          tsNs: event.tsNs.toString(),
        })),
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `carbon-ledger-analytics-${Date.now()}.json`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const getTopItems = (distribution: Record<string, number>, limit = 5) => {
    return Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-gradient-to-r from-chart-1 to-chart-1/80 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Analytics & Insights</h1>
        <p className="text-white/90">
          Comprehensive analytics for carbon credit trading, batch performance, and system activity.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "batches", label: "Batch Analytics", icon: "🌱" },
          { id: "activity", label: "Activity Analysis", icon: "⚡" },
          { id: "export", label: "Data Export", icon: "📤" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Supply</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{formatAmount(analytics.totalSupply)}</div>
                <p className="text-xs text-muted-foreground">tons CO₂ issued</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-chart-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-1">{formatAmount(analytics.totalAvailable)}</div>
                <p className="text-xs text-muted-foreground">tons CO₂ tradeable</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Retired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatAmount(analytics.totalRetired)}</div>
                <p className="text-xs text-muted-foreground">tons CO₂ offset</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-chart-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Royalty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-3">{(analytics.averageRoyalty / 10000).toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">average rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Standards Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Standards Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopItems(analytics.standardDistribution).map(([standard, count]) => (
                    <div key={standard} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{standard}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-chart-1 h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(analytics.standardDistribution))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vintage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Vintage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopItems(analytics.vintageDistribution).map(([vintage, count]) => (
                    <div key={vintage} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{vintage}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-chart-2 h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(analytics.vintageDistribution))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {getTopItems(analytics.tagDistribution, 10).map(([tag, count]) => (
                  <div key={tag} className="flex items-center space-x-1 bg-muted px-3 py-1 rounded-full">
                    <span className="text-sm">{tag}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batch Analytics Tab */}
      {activeTab === "batches" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>🌱</span>
                  <span>Batch Performance Analytics</span>
                </div>
                <Button onClick={loadAnalyticsData} disabled={loading} variant="outline" size="sm">
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batches.map((batch) => {
                  const utilizationRate =
                    Number(batch.totalSupply) > 0
                      ? Math.round(
                          ((Number(batch.totalSupply) - Number(batch.available)) * 100) / Number(batch.totalSupply),
                        )
                      : 0
                  return (
                    <div key={batch.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">
                            Batch #{batch.id} - {batch.projectId}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {batch.standard} • Vintage {batch.vintage}
                          </p>
                        </div>
                        <Badge variant={utilizationRate > 50 ? "default" : "outline"}>
                          {utilizationRate}% Utilized
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Supply</p>
                          <p className="font-semibold">{formatAmount(batch.totalSupply)} tons</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Available</p>
                          <p className="font-semibold text-chart-1">{formatAmount(batch.available)} tons</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Royalty Rate</p>
                          <p className="font-semibold">{(batch.royalty_ppm / 10000).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Issued</p>
                          <p className="font-semibold">{formatDate(batch.createdAtNs)}</p>
                        </div>
                      </div>

                      {/* Utilization Bar */}
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div
                          className="bg-secondary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${utilizationRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatAmount(batch.totalSupply - batch.available)} tons utilized of{" "}
                        {formatAmount(batch.totalSupply)} total
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Analysis Tab */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity by Action */}
            <Card>
              <CardHeader>
                <CardTitle>Activity by Action Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopItems(analytics.activityByAction).map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{action}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-chart-3 h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(analytics.activityByAction))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity by Actor */}
            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopItems(analytics.activityByActor).map(([actor, count]) => (
                    <div key={actor} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs font-medium">
                            {actor.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-mono text-sm">{actor}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-chart-4 h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(analytics.activityByActor))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditLog
                  .slice(-20)
                  .reverse()
                  .map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 hover:bg-muted rounded-lg">
                      <Badge variant="outline" className="text-xs">
                        {event.action}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{event.details}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {event.actor.slice(0, 8)}...{event.actor.slice(-4)}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(Number(event.tsNs) / 1000000).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Export Tab */}
      {activeTab === "export" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📤</span>
              <span>Data Export & Reporting</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Export Analytics Data</h4>
              <p className="text-sm text-blue-800">
                Export comprehensive analytics data including batch information, audit logs, and system metrics for
                external analysis or compliance reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                    <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time Range</label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-secondary">{analytics.totalBatches}</p>
                <p className="text-sm text-muted-foreground">Batches to Export</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-chart-1">{auditLog.length}</p>
                <p className="text-sm text-muted-foreground">Audit Events</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-chart-3">{Object.keys(analytics.standardDistribution).length}</p>
                <p className="text-sm text-muted-foreground">Standards</p>
              </div>
            </div>

            <Button onClick={exportData} className="w-full" size="lg">
              📤 Export Analytics Data ({exportFormat.toUpperCase()})
            </Button>

            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Export includes:</p>
              <ul className="space-y-1">
                <li>• Complete batch information with metadata</li>
                <li>• Full audit log with timestamps</li>
                <li>• Analytics metrics and distributions</li>
                <li>• System activity summaries</li>
                <li>• Royalty and utilization data</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
