"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdminScreenProps {
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
  royalty_ppm: number
}

interface BatchStatus {
  Unverified?: null
  Verified?: null
  Flagged?: null
  Suspended?: null
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ actor, currentPrincipal }) => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"system" | "verification" | "oracles" | "users">("system")

  // System management state
  const [owner, setOwner] = useState<string>("")
  const [issuers, setIssuers] = useState<string[]>([])
  const [verifiers, setVerifiers] = useState<string[]>([])
  const [oracles, setOracles] = useState<string[]>([])
  const [newIssuer, setNewIssuer] = useState("")
  const [newVerifier, setNewVerifier] = useState("")
  const [newOracle, setNewOracle] = useState("")

  // Batch verification state
  const [batches, setBatches] = useState<CreditBatch[]>([])
  const [batchStatuses, setBatchStatuses] = useState<Record<number, BatchStatus>>({})
  const [selectedBatch, setSelectedBatch] = useState<CreditBatch | null>(null)
  const [verificationNote, setVerificationNote] = useState("")
  const [batchStatusUpdate, setBatchStatusUpdate] = useState("")

  // Oracle management state
  const [oracleEvent, setOracleEvent] = useState({
    source: "",
    payload: "",
  })

  const loadSystemData = async () => {
    try {
      setLoading(true)
      const [ownerResult, issuersResult, verifiersResult, oraclesResult] = await Promise.all([
        actor.getOwner(),
        actor.listIssuers(),
        actor.listVerifiers(),
        actor.listOracles(),
      ])
      setOwner(ownerResult.toString())
      setIssuers(issuersResult.map((p: any) => p.toString()))
      setVerifiers(verifiersResult.map((p: any) => p.toString()))
      setOracles(oraclesResult.map((p: any) => p.toString()))
    } catch (error) {
      console.error("Failed to load system data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadBatchData = async () => {
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
      console.error("Failed to load batch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSystemData()
    if (activeTab === "verification") {
      loadBatchData()
    }
  }, [actor, activeTab])

  const handleAddIssuer = async () => {
    if (!newIssuer.trim()) return
    try {
      setLoading(true)
      await actor.addIssuer(newIssuer)
      setNewIssuer("")
      await loadSystemData()
      alert("Issuer added successfully!")
    } catch (error) {
      console.error("Failed to add issuer:", error)
      alert(`Failed to add issuer: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVerifier = async () => {
    if (!newVerifier.trim()) return
    try {
      setLoading(true)
      await actor.addVerifier(newVerifier)
      setNewVerifier("")
      await loadSystemData()
      alert("Verifier added successfully!")
    } catch (error) {
      console.error("Failed to add verifier:", error)
      alert(`Failed to add verifier: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddOracle = async () => {
    if (!newOracle.trim()) return
    try {
      setLoading(true)
      await actor.addOracle(newOracle)
      setNewOracle("")
      await loadSystemData()
      alert("Oracle added successfully!")
    } catch (error) {
      console.error("Failed to add oracle:", error)
      alert(`Failed to add oracle: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyBatch = async () => {
    if (!selectedBatch || !verificationNote.trim()) return
    try {
      setLoading(true)
      await actor.verifyBatch(selectedBatch.id, verificationNote)
      setVerificationNote("")
      setSelectedBatch(null)
      await loadBatchData()
      alert("Batch verified successfully!")
    } catch (error) {
      console.error("Failed to verify batch:", error)
      alert(`Failed to verify batch: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFlagBatch = async () => {
    if (!selectedBatch || !verificationNote.trim()) return
    try {
      setLoading(true)
      await actor.flagBatch(selectedBatch.id, verificationNote)
      setVerificationNote("")
      setSelectedBatch(null)
      await loadBatchData()
      alert("Batch flagged successfully!")
    } catch (error) {
      console.error("Failed to flag batch:", error)
      alert(`Failed to flag batch: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSetBatchStatus = async () => {
    if (!selectedBatch || !batchStatusUpdate) return
    try {
      setLoading(true)
      const statusMap: Record<string, any> = {
        Unverified: { Unverified: null },
        Verified: { Verified: null },
        Flagged: { Flagged: null },
        Suspended: { Suspended: null },
      }
      await actor.setBatchStatus(selectedBatch.id, statusMap[batchStatusUpdate])
      setBatchStatusUpdate("")
      setSelectedBatch(null)
      await loadBatchData()
      alert("Batch status updated successfully!")
    } catch (error) {
      console.error("Failed to update batch status:", error)
      alert(`Failed to update batch status: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleIngestOracleEvent = async () => {
    if (!oracleEvent.source || !oracleEvent.payload) return
    try {
      setLoading(true)
      await actor.ingestOracleEvent(oracleEvent.source, oracleEvent.payload)
      setOracleEvent({ source: "", payload: "" })
      alert("Oracle event ingested successfully!")
    } catch (error) {
      console.error("Failed to ingest oracle event:", error)
      alert(`Failed to ingest oracle event: ${error}`)
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

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-destructive to-destructive/80 rounded-xl p-6 text-destructive-foreground">
        <h1 className="text-2xl font-bold mb-2">System Administration</h1>
        <p className="text-destructive-foreground/90">
          Manage system users, verify carbon credit batches, and configure oracle integrations.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: "system", label: "System Management", icon: "⚙️" },
          { id: "verification", label: "Batch Verification", icon: "✅" },
          { id: "oracles", label: "Oracle Integration", icon: "🔮" },
          { id: "users", label: "User Management", icon: "👥" },
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

      {/* System Management Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>👑</span>
                <span>System Owner</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Current System Owner</p>
                <p className="font-mono text-sm break-all">{owner}</p>
              </div>
            </CardContent>
          </Card>

          {/* Add New Roles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Issuer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Issuer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input value={newIssuer} onChange={(e) => setNewIssuer(e.target.value)} placeholder="Principal ID" />
                <Button onClick={handleAddIssuer} disabled={loading || !newIssuer.trim()} className="w-full">
                  Add Issuer
                </Button>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Current Issuers ({issuers.length}):</p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {issuers.map((issuer, index) => (
                      <p key={index} className="font-mono text-xs break-all">
                        {issuer}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Verifier */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Verifier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={newVerifier}
                  onChange={(e) => setNewVerifier(e.target.value)}
                  placeholder="Principal ID"
                />
                <Button onClick={handleAddVerifier} disabled={loading || !newVerifier.trim()} className="w-full">
                  Add Verifier
                </Button>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Current Verifiers ({verifiers.length}):</p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {verifiers.map((verifier, index) => (
                      <p key={index} className="font-mono text-xs break-all">
                        {verifier}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Oracle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Oracle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input value={newOracle} onChange={(e) => setNewOracle(e.target.value)} placeholder="Principal ID" />
                <Button onClick={handleAddOracle} disabled={loading || !newOracle.trim()} className="w-full">
                  Add Oracle
                </Button>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Current Oracles ({oracles.length}):</p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {oracles.map((oracle, index) => (
                      <p key={index} className="font-mono text-xs break-all">
                        {oracle}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Batch Verification Tab */}
      {activeTab === "verification" && (
        <div className="space-y-6">
          {selectedBatch ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>Verify Batch #{selectedBatch.id}</span>
                  </div>
                  <Button onClick={() => setSelectedBatch(null)} variant="outline" size="sm">
                    Back to List
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Batch Details */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Batch Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Project ID</p>
                      <p className="font-medium">{selectedBatch.projectId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Standard</p>
                      <p className="font-medium">{selectedBatch.standard}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vintage</p>
                      <p className="font-medium">{selectedBatch.vintage}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Supply</p>
                      <p className="font-medium">{formatAmount(selectedBatch.totalSupply)} tons</p>
                    </div>
                  </div>
                  {selectedBatch.metadata && (
                    <div className="mt-3">
                      <p className="text-muted-foreground text-sm mb-1">Metadata</p>
                      <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                        {selectedBatch.metadata}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Verify/Flag */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Verification Actions</h4>
                    <Textarea
                      value={verificationNote}
                      onChange={(e) => setVerificationNote(e.target.value)}
                      placeholder="Add verification notes, methodology review, documentation check, or issues found..."
                      rows={4}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleVerifyBatch}
                        disabled={loading || !verificationNote.trim()}
                        className="flex-1"
                      >
                        ✅ Verify Batch
                      </Button>
                      <Button
                        onClick={handleFlagBatch}
                        disabled={loading || !verificationNote.trim()}
                        variant="destructive"
                        className="flex-1"
                      >
                        🚩 Flag Batch
                      </Button>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Status Management</h4>
                    <Select value={batchStatusUpdate} onValueChange={setBatchStatusUpdate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unverified">Unverified</SelectItem>
                        <SelectItem value="Verified">Verified</SelectItem>
                        <SelectItem value="Flagged">Flagged</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleSetBatchStatus}
                      disabled={loading || !batchStatusUpdate}
                      variant="outline"
                      className="w-full bg-transparent"
                    >
                      Update Status
                    </Button>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Current Status:</p>
                      {getStatusBadge(batchStatuses[selectedBatch.id])}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>Batch Verification Queue</span>
                  </div>
                  <Button onClick={loadBatchData} disabled={loading} variant="outline" size="sm">
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">✅</div>
                    <p className="text-muted-foreground">No batches to verify</p>
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
                              <h3 className="font-semibold">Batch #{batch.id}</h3>
                              {getStatusBadge(batchStatuses[batch.id])}
                            </div>
                            <p className="text-muted-foreground">{batch.projectId}</p>
                          </div>
                          <Button onClick={() => setSelectedBatch(batch)} size="sm">
                            Review
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Standard</p>
                            <p className="font-medium">{batch.standard}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Vintage</p>
                            <p className="font-medium">{batch.vintage}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Supply</p>
                            <p className="font-medium">{formatAmount(batch.totalSupply)} tons</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Issued</p>
                            <p className="font-medium">{formatDate(batch.createdAtNs)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Oracle Integration Tab */}
      {activeTab === "oracles" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔮</span>
                <span>Oracle Event Ingestion</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Oracle Integration</h4>
                <p className="text-sm text-blue-800">
                  Ingest external data events from registered oracles. This allows off-chain systems to provide
                  additional verification data, market prices, or environmental monitoring information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Oracle Source Principal</label>
                  <Input
                    value={oracleEvent.source}
                    onChange={(e) => setOracleEvent({ ...oracleEvent, source: e.target.value })}
                    placeholder="Principal ID of oracle source"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Event Payload</label>
                  <Textarea
                    value={oracleEvent.payload}
                    onChange={(e) => setOracleEvent({ ...oracleEvent, payload: e.target.value })}
                    placeholder='{"type": "price_update", "price": 12.50, "timestamp": 1640995200}'
                    rows={3}
                  />
                </div>
              </div>

              <Button
                onClick={handleIngestOracleEvent}
                disabled={loading || !oracleEvent.source || !oracleEvent.payload}
                className="w-full"
              >
                {loading ? "Ingesting Event..." : "Ingest Oracle Event"}
              </Button>
            </CardContent>
          </Card>

          {/* Registered Oracles */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Oracles ({oracles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {oracles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔮</div>
                  <p className="text-muted-foreground">No oracles registered</p>
                  <p className="text-sm text-muted-foreground mt-1">Add oracles in System Management</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {oracles.map((oracle, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-mono text-sm">{oracle}</p>
                        <p className="text-xs text-muted-foreground">Authorized Oracle</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>👥</span>
              <span>User Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* System Roles Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Issuers ({issuers.length})</h4>
                  <p className="text-sm text-green-800 mb-3">Can create new carbon credit batches</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {issuers.map((issuer, index) => (
                      <p key={index} className="text-xs font-mono text-green-700 break-all">
                        {issuer}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Verifiers ({verifiers.length})</h4>
                  <p className="text-sm text-blue-800 mb-3">Can verify and flag carbon credit batches</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {verifiers.map((verifier, index) => (
                      <p key={index} className="text-xs font-mono text-blue-700 break-all">
                        {verifier}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Oracles ({oracles.length})</h4>
                  <p className="text-sm text-purple-800 mb-3">Can ingest external data events</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {oracles.map((oracle, index) => (
                      <p key={index} className="text-xs font-mono text-purple-700 break-all">
                        {oracle}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Role Permissions */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">Role Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-600 mb-2">Issuer Permissions</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Issue new carbon credit batches</li>
                      <li>• Set royalty rates</li>
                      <li>• Update metadata versions</li>
                      <li>• Mint credits to recipients</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-600 mb-2">Verifier Permissions</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Verify carbon credit batches</li>
                      <li>• Flag suspicious batches</li>
                      <li>• Update batch status</li>
                      <li>• Add verification notes</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-purple-600 mb-2">Oracle Permissions</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Ingest external data events</li>
                      <li>• Provide market price data</li>
                      <li>• Submit monitoring reports</li>
                      <li>• Trigger automated actions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
