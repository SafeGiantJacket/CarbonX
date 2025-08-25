"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface HoldingsPanelProps {
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
}

export const HoldingsPanel: React.FC<HoldingsPanelProps> = ({ actor, currentPrincipal }) => {
  const [holdings, setHoldings] = useState<BalanceView[]>([])
  const [batches, setBatches] = useState<CreditBatch[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [holdingsResult, batchesResult] = await Promise.all([actor.myHoldings([]), actor.listBatches()])
      setHoldings(holdingsResult)
      setBatches(batchesResult)
    } catch (error) {
      console.error("Failed to load holdings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [actor])

  const getBatchInfo = (batchId: number) => {
    return batches.find((batch) => batch.id === batchId)
  }

  const formatAmount = (amount: bigint) => {
    return amount.toString()
  }

  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Carbon Credit Holdings</h2>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {holdings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🌱</div>
            <p className="text-gray-500">No carbon credits held</p>
            <p className="text-sm text-gray-400 mt-1">Credits you own will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {holdings.map((holding, index) => {
              const batch = getBatchInfo(holding.batchId)
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Batch #{holding.batchId} - {batch?.projectId || "Unknown Project"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {batch?.standard} • Vintage {batch?.vintage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">{formatAmount(holding.amount)} tons CO₂</p>
                    </div>
                  </div>

                  {batch && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Issued:</span>
                          <span className="ml-2 text-gray-900">{formatDate(batch.createdAtNs)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Supply:</span>
                          <span className="ml-2 text-gray-900">{formatAmount(batch.totalSupply)} tons</span>
                        </div>
                      </div>

                      {batch.tags.length > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-500 text-sm">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {batch.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {batch.metadata && (
                        <div className="mt-2">
                          <span className="text-gray-500 text-sm">Metadata:</span>
                          <p className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded">{batch.metadata}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Portfolio Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-600">Total Holdings</p>
                <p className="text-lg font-semibold text-green-900">
                  {holdings.reduce((sum, holding) => sum + Number(holding.amount), 0)} tons CO₂
                </p>
              </div>
              <div>
                <p className="text-green-600">Unique Batches</p>
                <p className="text-lg font-semibold text-green-900">{holdings.length}</p>
              </div>
              <div>
                <p className="text-green-600">Principal ID</p>
                <p className="text-xs font-mono text-green-900">{currentPrincipal}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
