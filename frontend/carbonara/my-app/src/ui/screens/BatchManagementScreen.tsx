"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BatchManagementScreenProps {
  actor: any
  currentPrincipal: string
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
  royalty_ppm: number | bigint
}

interface BatchStatus {
  Unverified?: null
  Verified?: null
  Flagged?: null
  Suspended?: null
}

export const BatchManagementScreen: React.FC<BatchManagementScreenProps> = ({ actor, currentPrincipal }) => {
  const [batches, setBatches] = useState<CreditBatch[]>([])
  const [batchStatuses, setBatchStatuses] = useState<Record<number, BatchStatus>>({})
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"issue" | "manage" | "metadata">("issue")
  const [selectedBatch, setSelectedBatch] = useState<CreditBatch | null>(null)

  // Issue form state
  const [issueForm, setIssueForm] = useState({
    projectId: "",
    standard: "VCS",
    vintage: new Date().getFullYear(),
    totalSupply: "",
    metadata: "",
    tags: "",
    royalty_ppm: "10000", // 1% default royalty
  })

  // Metadata versioning state
  const [metadataHistory, setMetadataHistory] = useState<string[]>([])
  const [newMetadata, setNewMetadata] = useState("")

  const loadBatches = async () => {
    try {
      setLoading(true)
      const batchesResult = await actor.listBatches()
      setBatches(batchesResult)

      // Load batch statuses
      const statusPromises = batchesResult.map(async (batch: CreditBatch) => {
        try {
          const status = await actor.getBatchStatus(batch.id)
          return { id: batch.id, status }
        } catch {
          return { id: batch.id, status: null }
        }
      })
      const statuses = await Promise.all(statusPromises)
      const statusMap = statuses.reduce(
        (acc, { id, status }) => {
          acc[id] = status
          return acc
        },
        {} as Record<number, BatchStatus>,
      )
      setBatchStatuses(statusMap)
    } catch (error) {
      console.error("Failed to load batches:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [actor])

  const handleIssueBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueForm.projectId || !issueForm.totalSupply) return

    try {
      setLoading(true)
      const tags = issueForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const batchId = await actor.issueBatch(
        issueForm.projectId,
        issueForm.standard,
        Number(issueForm.vintage),
        BigInt(issueForm.totalSupply),
        issueForm.metadata,
        tags,
        Number(issueForm.royalty_ppm),
      )

      alert(`Successfully issued batch with ID: ${batchId}`)
      setIssueForm({
        projectId: "",
        standard: "VCS",
        vintage: new Date().getFullYear(),
        totalSupply: "",
        metadata: "",
        tags: "",
        royalty_ppm: "10000",
      })
      await loadBatches()
    } catch (error) {
      console.error("Failed to issue batch:", error)
      alert(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const loadMetadataHistory = async (batchId: number) => {
    try {
      const history = await actor.getMetadataHistory(batchId)
      setMetadataHistory(history || [])
    } catch (error) {
      console.error("Failed to load metadata history:", error)
    }
  }

  const handleAddMetadataVersion = async () => {
    if (!selectedBatch || !newMetadata.trim()) return

    try {
      setLoading(true)
      await actor.appendMetadataVersion(selectedBatch.id, newMetadata)
      setNewMetadata("")
      await loadMetadataHistory(selectedBatch.id)
      await loadBatches()
      alert("Metadata version added successfully!")
    } catch (error) {
      console.error("Failed to add metadata version:", error)
      alert(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: BatchStatus | null) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>
    if ("Verified" in status) return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    if ("Flagged" in status) return <Badge variant="destructive">Flagged</Badge>
    if ("Suspended" in status) return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>
    return <Badge variant="outline">Unverified</Badge>
  }

  const formatAmount = (amount: bigint) => Number(amount).toLocaleString()
  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleDateString()
  }

  const formatRoyalty = (ppm: number | bigint) => {
    const numericPpm = typeof ppm === "bigint" ? Number(ppm) : Number(ppm)
    return `${(numericPpm / 10000).toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: "issue", label: "Issue New Batch", icon: "🌱" },
          { id: "manage", label: "Manage Batches", icon: "📋" },
          { id: "metadata", label: "Metadata Versioning", icon: "📝" },
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

      {/* Issue New Batch Tab */}
      {activeTab === "issue" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🌱</span>
              <span>Issue New Carbon Credit Batch</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssueBatch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project ID *</label>
                    <Input
                      value={issueForm.projectId}
                      onChange={(e) => setIssueForm({ ...issueForm, projectId: e.target.value })}
                      placeholder="e.g., FOREST-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Standard</label>
                    <Select
                      value={issueForm.standard}
                      onValueChange={(value) => setIssueForm({ ...issueForm, standard: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VCS">VCS (Verified Carbon Standard)</SelectItem>
                        <SelectItem value="CDM">CDM (Clean Development Mechanism)</SelectItem>
                        <SelectItem value="GS">Gold Standard</SelectItem>
                        <SelectItem value="CAR">Climate Action Reserve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Vintage Year</label>
                    <Input
                      type="number"
                      value={issueForm.vintage}
                      onChange={(e) => setIssueForm({ ...issueForm, vintage: Number(e.target.value) })}
                      min="2000"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Total Supply (tons CO₂) *</label>
                    <Input
                      type="number"
                      value={issueForm.totalSupply}
                      onChange={(e) => setIssueForm({ ...issueForm, totalSupply: e.target.value })}
                      placeholder="1000"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Royalty Rate (PPM) *
                      <span className="text-xs text-muted-foreground ml-2">
                        Current: {formatRoyalty(Number(issueForm.royalty_ppm))}
                      </span>
                    </label>
                    <Input
                      type="number"
                      value={issueForm.royalty_ppm}
                      onChange={(e) => setIssueForm({ ...issueForm, royalty_ppm: e.target.value })}
                      placeholder="10000"
                      min="0"
                      max="1000000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Parts per million (10000 = 1%, 50000 = 5%)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <Input
                      value={issueForm.tags}
                      onChange={(e) => setIssueForm({ ...issueForm, tags: e.target.value })}
                      placeholder="forestry, REDD+, biodiversity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Metadata (JSON or URL)</label>
                    <Textarea
                      value={issueForm.metadata}
                      onChange={(e) => setIssueForm({ ...issueForm, metadata: e.target.value })}
                      placeholder='{"location": "Brazil", "methodology": "REDD+"}'
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Issuing Batch..." : "Issue Carbon Credit Batch"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Manage Batches Tab */}
      {activeTab === "manage" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>📋</span>
                <span>Manage Carbon Credit Batches</span>
              </div>
              <Button onClick={loadBatches} disabled={loading} variant="outline" size="sm">
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {batches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-muted-foreground">No batches issued yet</p>
                <p className="text-sm text-muted-foreground mt-1">Issue your first batch to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">Batch #{batch.id}</h3>
                          {getStatusBadge(batchStatuses[batch.id])}
                        </div>
                        <p className="text-muted-foreground">{batch.projectId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-secondary">{formatAmount(batch.totalSupply)}</p>
                        <p className="text-sm text-muted-foreground">tons CO₂</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Standard</p>
                        <p className="font-medium">{batch.standard}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Vintage</p>
                        <p className="font-medium">{batch.vintage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="font-medium text-green-600">{formatAmount(batch.available)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Royalty</p>
                        <p className="font-medium">{formatRoyalty(batch.royalty_ppm)}</p>
                      </div>
                    </div>

                    {batch.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {batch.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Issued: {formatDate(batch.createdAtNs)}</span>
                      <span>
                        Issuer: {batch.issuer.slice(0, 8)}...{batch.issuer.slice(-4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata Versioning Tab */}
      {activeTab === "metadata" && (
        <div className="space-y-6">
          {/* Batch Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📝</span>
                <span>Metadata Versioning</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Batch for Metadata Management</label>
                  <Select
                    value={selectedBatch?.id.toString() || ""}
                    onValueChange={(value) => {
                      const batch = batches.find((b) => b.id === Number(value))
                      setSelectedBatch(batch || null)
                      if (batch) loadMetadataHistory(batch.id)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          Batch #{batch.id} - {batch.projectId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBatch && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Current Metadata</h4>
                    <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
                      {selectedBatch.metadata || "No metadata"}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add New Version */}
          {selectedBatch && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Metadata Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={newMetadata}
                    onChange={(e) => setNewMetadata(e.target.value)}
                    placeholder='{"location": "Updated location", "methodology": "Enhanced REDD+"}'
                    rows={6}
                  />
                  <Button onClick={handleAddMetadataVersion} disabled={loading || !newMetadata.trim()}>
                    {loading ? "Adding Version..." : "Add Metadata Version"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata History */}
          {selectedBatch && metadataHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata History ({metadataHistory.length} versions)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metadataHistory.map((metadata, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant={index === metadataHistory.length - 1 ? "default" : "outline"}>
                          Version {index + 1} {index === metadataHistory.length - 1 && "(Current)"}
                        </Badge>
                      </div>
                      <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">{metadata}</pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
