"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface VerifierPanelProps {
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
}

export const VerifierPanel: React.FC<VerifierPanelProps> = ({ actor, currentPrincipal }) => {
  const [batches, setBatches] = useState<CreditBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<CreditBatch | null>(null)
  const [verifyNote, setVerifyNote] = useState("")
  const [flagNote, setFlagNote] = useState("")

  const loadBatches = async () => {
    try {
      setLoading(true)
      const batchesResult = await actor.listBatches()
      setBatches(batchesResult)
    } catch (error) {
      console.error("Failed to load batches:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [actor])

  const handleVerify = async () => {
    if (!selectedBatch || !verifyNote.trim()) return

    try {
      setLoading(true)
      await actor.verifyBatch(selectedBatch.id, verifyNote)
      setVerifyNote("")
      setSelectedBatch(null)
      alert("Batch verified successfully!")
    } catch (error) {
      console.error("Failed to verify batch:", error)
      alert("Failed to verify batch: " + error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlag = async () => {
    if (!selectedBatch || !flagNote.trim()) return

    try {
      setLoading(true)
      await actor.flagBatch(selectedBatch.id, flagNote)
      setFlagNote("")
      setSelectedBatch(null)
      alert("Batch flagged successfully!")
    } catch (error) {
      console.error("Failed to flag batch:", error)
      alert("Failed to flag batch: " + error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: bigint) => {
    return amount.toString()
  }

  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleDateString()
  }

  const parseMetadata = (metadata: string) => {
    try {
      return JSON.parse(metadata)
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Verification Actions */}
      {selectedBatch && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Verify Batch #{selectedBatch.id} - {selectedBatch.projectId}
          </h2>

          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Standard:</span>
                <span className="ml-2 font-medium">{selectedBatch.standard}</span>
              </div>
              <div>
                <span className="text-gray-500">Vintage:</span>
                <span className="ml-2 font-medium">{selectedBatch.vintage}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Supply:</span>
                <span className="ml-2 font-medium">{formatAmount(selectedBatch.totalSupply)} tons</span>
              </div>
              <div>
                <span className="text-gray-500">Issued:</span>
                <span className="ml-2 font-medium">{formatDate(selectedBatch.createdAtNs)}</span>
              </div>
            </div>

            {selectedBatch.metadata && (
              <div className="mt-3">
                <span className="text-gray-500 text-sm">Metadata:</span>
                <pre className="text-xs text-gray-700 mt-1 bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(parseMetadata(selectedBatch.metadata) || selectedBatch.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verify */}
            <div className="space-y-3">
              <h3 className="font-medium text-green-900">✅ Verify Batch</h3>
              <textarea
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                placeholder="Add verification notes (methodology review, documentation check, etc.)"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                onClick={handleVerify}
                disabled={loading || !verifyNote.trim()}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Verify Batch
              </button>
            </div>

            {/* Flag */}
            <div className="space-y-3">
              <h3 className="font-medium text-red-900">🚩 Flag Batch</h3>
              <textarea
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
                placeholder="Describe issues found (documentation problems, methodology concerns, etc.)"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                onClick={handleFlag}
                disabled={loading || !flagNote.trim()}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Flag Batch
              </button>
            </div>
          </div>

          <button onClick={() => setSelectedBatch(null)} className="mt-4 text-gray-600 hover:text-gray-800 text-sm">
            ← Back to batch list
          </button>
        </div>
      )}

      {/* Batch List */}
      {!selectedBatch && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Carbon Credit Batches for Verification</h2>
            <button
              onClick={loadBatches}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Verifier Role:</strong> Review carbon credit batches for compliance with standards and
              methodologies. Verify legitimate projects or flag suspicious ones.
            </p>
          </div>

          {batches.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🔍</div>
              <p className="text-gray-500">No batches to verify</p>
              <p className="text-sm text-gray-400 mt-1">Issued batches will appear here for verification</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => (
                <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        Batch #{batch.id} - {batch.projectId}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {batch.standard} • Vintage {batch.vintage} • {formatAmount(batch.totalSupply)} tons CO₂
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <span className="text-gray-500">Issued:</span>
                          <span className="ml-2">{formatDate(batch.createdAtNs)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Available:</span>
                          <span className="ml-2 font-medium">{formatAmount(batch.available)} tons</span>
                        </div>
                      </div>

                      {batch.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {batch.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Issuer: <code>{batch.issuer}</code>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBatch(batch)}
                      className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
