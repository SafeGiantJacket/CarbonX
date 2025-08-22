"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface MintPanelProps {
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

export const MintPanel: React.FC<MintPanelProps> = ({ actor, currentPrincipal }) => {
  const [batches, setBatches] = useState<CreditBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [mintForm, setMintForm] = useState({
    batchId: "",
    recipient: currentPrincipal,
    amount: "",
  })

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

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mintForm.batchId || !mintForm.recipient || !mintForm.amount) return

    try {
      setLoading(true)
      await actor.mintTo(Number.parseInt(mintForm.batchId), mintForm.recipient, BigInt(mintForm.amount))
      setMintForm({ ...mintForm, amount: "" })
      await loadBatches()
      alert("Successfully minted credits!")
    } catch (error) {
      console.error("Failed to mint credits:", error)
      alert("Failed to mint credits: " + error)
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

  const getSelectedBatch = () => {
    return batches.find((batch) => batch.id === Number.parseInt(mintForm.batchId))
  }

  return (
    <div className="space-y-6">
      {/* Mint Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mint Carbon Credits</h2>
        <p className="text-sm text-gray-600 mb-4">
          Mint credits from available batches to specific recipients. Only authorized issuers can mint credits.
        </p>

        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
            <select
              value={mintForm.batchId}
              onChange={(e) => setMintForm({ ...mintForm, batchId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Choose batch to mint from</option>
              {batches
                .filter((batch) => batch.available > 0)
                .map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    Batch #{batch.id} - {batch.projectId} ({formatAmount(batch.available)} available)
                  </option>
                ))}
            </select>
          </div>

          {getSelectedBatch() && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Batch Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Standard:</span>
                  <span className="ml-2">{getSelectedBatch()?.standard}</span>
                </div>
                <div>
                  <span className="text-gray-500">Vintage:</span>
                  <span className="ml-2">{getSelectedBatch()?.vintage}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Supply:</span>
                  <span className="ml-2">{formatAmount(getSelectedBatch()?.totalSupply || BigInt(0))} tons</span>
                </div>
                <div>
                  <span className="text-gray-500">Available:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {formatAmount(getSelectedBatch()?.available || BigInt(0))} tons
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Principal ID</label>
            <input
              type="text"
              value={mintForm.recipient}
              onChange={(e) => setMintForm({ ...mintForm, recipient: e.target.value })}
              placeholder="Principal ID of recipient"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Mint (tons CO₂)</label>
            <input
              type="number"
              value={mintForm.amount}
              onChange={(e) => setMintForm({ ...mintForm, amount: e.target.value })}
              placeholder="100"
              min="1"
              max={getSelectedBatch() ? formatAmount(getSelectedBatch()!.available) : undefined}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !mintForm.batchId || !mintForm.recipient || !mintForm.amount}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Minting Credits..." : "Mint Carbon Credits"}
          </button>
        </form>
      </div>

      {/* Available Batches */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Batches for Minting</h2>
          <button
            onClick={loadBatches}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📦</div>
            <p className="text-gray-500">No batches available</p>
            <p className="text-sm text-gray-400 mt-1">Issue new batches to start minting</p>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Batch #{batch.id} - {batch.projectId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {batch.standard} • Vintage {batch.vintage} • Issued {formatDate(batch.createdAtNs)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Available to Mint</p>
                    <p className={`text-lg font-semibold ${batch.available > 0 ? "text-green-600" : "text-gray-400"}`}>
                      {formatAmount(batch.available)} / {formatAmount(batch.totalSupply)} tons
                    </p>
                  </div>
                </div>

                {batch.tags.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {batch.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  Issuer: <code>{batch.issuer}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
