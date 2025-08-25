"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PortfolioScreenProps {
  actor: any
  currentPrincipal: string
}

interface BalanceView {
  batchId: number
  amount: bigint
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

interface Retirement {
  id: bigint
  batchId: number
  owner: string
  amount: bigint
  reason: string
  tsNs: bigint
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({ actor, currentPrincipal }) => {
  const [holdings, setHoldings] = useState<BalanceView[]>([])
  const [batches, setBatches] = useState<CreditBatch[]>([])
  const [retirements, setRetirements] = useState<Retirement[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"holdings" | "retire" | "history">("holdings")

  // Transfer form
  const [transferForm, setTransferForm] = useState({
    batchId: "",
    recipient: "",
    amount: "",
  })

  // Retirement form
  const [retireForm, setRetireForm] = useState({
    batchId: "",
    amount: "",
    reason: "",
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [holdingsResult, batchesResult, retirementsResult] = await Promise.all([
        actor.myHoldings([]),
        actor.listBatches(),
        actor.myRetirements([]),
      ])
      setHoldings(holdingsResult)
      setBatches(batchesResult)
      setRetirements(retirementsResult)
    } catch (error) {
      console.error("Failed to load portfolio data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [actor])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferForm.batchId || !transferForm.recipient || !transferForm.amount) return

    try {
      setLoading(true)
      await actor.transfer(Number.parseInt(transferForm.batchId), transferForm.recipient, BigInt(transferForm.amount))
      setTransferForm({ batchId: "", recipient: "", amount: "" })
      await loadData()
      alert("Transfer completed successfully!")
    } catch (error) {
      console.error("Failed to transfer credits:", error)
      alert(`Failed to transfer credits: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRetire = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!retireForm.batchId || !retireForm.amount || !retireForm.reason) return

    try {
      setLoading(true)
      await actor.retire(Number.parseInt(retireForm.batchId), BigInt(retireForm.amount), retireForm.reason)
      setRetireForm({ batchId: "", amount: "", reason: "" })
      await loadData()
      alert("Credits retired successfully!")
    } catch (error) {
      console.error("Failed to retire credits:", error)
      alert(`Failed to retire credits: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getBatchInfo = (batchId: number) => {
    return batches.find((batch) => batch.id === batchId)
  }

  const formatAmount = (amount: bigint) => Number(amount).toLocaleString()
  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleDateString()
  }

  const totalHoldings = holdings.reduce((sum, holding) => sum + Number(holding.amount), 0)
  const totalRetired = retirements.reduce((sum, retirement) => sum + Number(retirement.amount), 0)
  const portfolioValue = totalHoldings * 12.5 // Estimated at $12.5/ton
  const uniqueBatches = new Set(holdings.map((h) => h.batchId)).size

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalHoldings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">tons CO₂ equivalent</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              ${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">estimated market value</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{uniqueBatches}</div>
            <p className="text-xs text-muted-foreground">different projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retired Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalRetired.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">tons CO₂ offset</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: "holdings", label: "My Holdings", icon: "💼" },
          { id: "retire", label: "Retire Credits", icon: "🌍" },
          { id: "history", label: "Retirement History", icon: "📜" },
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

      {/* Holdings Tab */}
      {activeTab === "holdings" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>💼</span>
                  <span>My Carbon Credit Holdings</span>
                </div>
                <Button onClick={loadData} disabled={loading} variant="outline" size="sm">
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {holdings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💼</div>
                  <p className="text-muted-foreground">No carbon credits held</p>
                  <p className="text-sm text-muted-foreground mt-1">Purchase credits to build your portfolio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {holdings.map((holding, index) => {
                    const batch = getBatchInfo(holding.batchId)
                    const estimatedValue = Number(holding.amount) * 12.5
                    return (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">Batch #{holding.batchId}</h3>
                              {batch && <Badge variant="secondary">{batch.standard}</Badge>}
                            </div>
                            <p className="text-muted-foreground">{batch?.projectId || "Unknown Project"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-secondary">{formatAmount(holding.amount)}</p>
                            <p className="text-sm text-muted-foreground">tons CO₂</p>
                          </div>
                        </div>

                        {batch && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Vintage</p>
                              <p className="font-medium">{batch.vintage}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Estimated Value</p>
                              <p className="font-medium text-chart-1">${estimatedValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Royalty Rate</p>
                              <p className="font-medium">{(batch.royalty_ppm / 10000).toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Issued</p>
                              <p className="font-medium">{formatDate(batch.createdAtNs)}</p>
                            </div>
                          </div>
                        )}

                        {batch?.tags && batch.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {batch.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Transfer Form */}
                        <div className="border-t border-border pt-3">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              setTransferForm({ ...transferForm, batchId: holding.batchId.toString() })
                              handleTransfer(e)
                            }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-2"
                          >
                            <Input
                              placeholder="Recipient Principal"
                              value={transferForm.batchId === holding.batchId.toString() ? transferForm.recipient : ""}
                              onChange={(e) =>
                                setTransferForm({
                                  ...transferForm,
                                  batchId: holding.batchId.toString(),
                                  recipient: e.target.value,
                                })
                              }
                              className="text-xs"
                            />
                            <Input
                              type="number"
                              placeholder="Amount"
                              max={Number(holding.amount)}
                              min="1"
                              value={transferForm.batchId === holding.batchId.toString() ? transferForm.amount : ""}
                              onChange={(e) =>
                                setTransferForm({
                                  ...transferForm,
                                  batchId: holding.batchId.toString(),
                                  amount: e.target.value,
                                })
                              }
                              className="text-xs"
                            />
                            <Button type="submit" disabled={loading} size="sm" variant="outline">
                              Transfer
                            </Button>
                          </form>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Retire Credits Tab */}
      {activeTab === "retire" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🌍</span>
              <span>Retire Carbon Credits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">About Carbon Credit Retirement</h4>
              <p className="text-sm text-blue-800">
                Retiring carbon credits permanently removes them from circulation, representing your commitment to
                offset emissions. Retired credits cannot be traded or reused, making this action irreversible.
              </p>
            </div>

            <form onSubmit={handleRetire} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Batch to Retire From</label>
                  <Select
                    value={retireForm.batchId}
                    onValueChange={(value) => setRetireForm({ ...retireForm, batchId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {holdings.map((holding) => {
                        const batch = getBatchInfo(holding.batchId)
                        return (
                          <SelectItem key={holding.batchId} value={holding.batchId.toString()}>
                            Batch #{holding.batchId} - {batch?.projectId} ({formatAmount(holding.amount)} tons
                            available)
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount to Retire (tons CO₂)</label>
                  <Input
                    type="number"
                    value={retireForm.amount}
                    onChange={(e) => setRetireForm({ ...retireForm, amount: e.target.value })}
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Retirement Reason *</label>
                <Textarea
                  value={retireForm.reason}
                  onChange={(e) => setRetireForm({ ...retireForm, reason: e.target.value })}
                  placeholder="e.g., Offsetting company emissions for Q4 2024, Personal carbon footprint offset, Event neutralization"
                  rows={4}
                />
              </div>

              {retireForm.batchId && retireForm.amount && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-medium text-destructive mb-2">Retirement Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount to Retire:</span>
                      <span className="ml-2 font-semibold">{retireForm.amount} tons CO₂</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Environmental Impact:</span>
                      <span className="ml-2 font-semibold text-secondary">
                        -{Number(retireForm.amount).toLocaleString()} tons CO₂
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-destructive mt-2">
                    ⚠️ This action is irreversible. Credits will be permanently removed from circulation.
                  </p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full" variant="destructive">
                {loading ? "Retiring Credits..." : "Retire Carbon Credits"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Retirement History Tab */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📜</span>
              <span>Retirement History ({retirements.length} events)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {retirements.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📜</div>
                <p className="text-muted-foreground">No retirements yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Retire credits to build your environmental impact history
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {retirements
                  .slice()
                  .reverse()
                  .map((retirement) => {
                    const batch = getBatchInfo(retirement.batchId)
                    return (
                      <div
                        key={retirement.id.toString()}
                        className="border border-border rounded-lg p-4 bg-destructive/5"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">Retirement #{retirement.id.toString()}</h3>
                              <Badge variant="destructive">Retired</Badge>
                            </div>
                            <p className="text-muted-foreground">
                              Batch #{retirement.batchId} - {batch?.projectId || "Unknown Project"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-destructive">{formatAmount(retirement.amount)}</p>
                            <p className="text-sm text-muted-foreground">tons CO₂ offset</p>
                          </div>
                        </div>

                        <div className="bg-background p-3 rounded border mb-3">
                          <p className="text-sm">
                            <span className="font-medium">Reason:</span> {retirement.reason}
                          </p>
                        </div>

                        <div className="text-xs text-muted-foreground">Retired on: {formatDate(retirement.tsNs)}</div>
                      </div>
                    )
                  })}
              </div>
            )}

            {retirements.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="bg-secondary/10 rounded-lg p-4">
                  <h4 className="font-medium text-secondary mb-2">Environmental Impact Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total CO₂ Offset</p>
                      <p className="text-2xl font-bold text-secondary">{totalRetired.toLocaleString()} tons</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retirement Events</p>
                      <p className="text-2xl font-bold text-secondary">{retirements.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
