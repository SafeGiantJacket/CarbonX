"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface RetirementPanelProps {
  actor: any
  currentPrincipal: string
}

interface Retirement {
  id: bigint
  batchId: number
  owner: string
  amount: bigint
  reason: string
  tsNs: bigint
}

interface BalanceView {
  batchId: number
  amount: bigint
}

export const RetirementPanel: React.FC<RetirementPanelProps> = ({ actor, currentPrincipal }) => {
  const [retirements, setRetirements] = useState<Retirement[]>([])
  const [holdings, setHoldings] = useState<BalanceView[]>([])
  const [loading, setLoading] = useState(false)
  const [retireForm, setRetireForm] = useState({
    batchId: "",
    amount: "",
    reason: "",
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [retirementsResult, holdingsResult] = await Promise.all([actor.myRetirements([]), actor.myHoldings([])])
      setRetirements(retirementsResult)
      setHoldings(holdingsResult)
    } catch (error) {
      console.error("Failed to load retirement data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [actor])

  const handleRetire = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!retireForm.batchId || !retireForm.amount || !retireForm.reason) return

    try {
      setLoading(true)
      await actor.retire(Number.parseInt(retireForm.batchId), BigInt(retireForm.amount), retireForm.reason)
      setRetireForm({ batchId: "", amount: "", reason: "" })
      await loadData()
    } catch (error) {
      console.error("Failed to retire credits:", error)
      alert("Failed to retire credits: " + error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleDateString()
  }

  const totalRetired = retirements.reduce((sum, retirement) => sum + Number(retirement.amount), 0)

  return (
    <div className="space-y-6">
      {/* Retire Credits Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Retire Carbon Credits</h2>
        <p className="text-sm text-gray-600 mb-4">
          Permanently retire carbon credits to offset your emissions. Retired credits cannot be traded or reused.
        </p>

        <form onSubmit={handleRetire} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
            <select
              value={retireForm.batchId}
              onChange={(e) => setRetireForm({ ...retireForm, batchId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Choose batch to retire from</option>
              {holdings.map((holding) => (
                <option key={holding.batchId} value={holding.batchId}>
                  Batch #{holding.batchId} ({holding.amount.toString()} tons available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Retire (tons CO₂)</label>
            <input
              type="number"
              value={retireForm.amount}
              onChange={(e) => setRetireForm({ ...retireForm, amount: e.target.value })}
              placeholder="100"
              min="1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retirement Reason</label>
            <textarea
              value={retireForm.reason}
              onChange={(e) => setRetireForm({ ...retireForm, reason: e.target.value })}
              placeholder="e.g., Offsetting company emissions for Q4 2024"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !retireForm.batchId || !retireForm.amount || !retireForm.reason}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Retiring Credits..." : "Retire Carbon Credits"}
          </button>
        </form>
      </div>

      {/* Retirement History */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Retirement History</h2>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Summary */}
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-red-900 mb-2">Retirement Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-red-600">Total Retired</p>
              <p className="text-2xl font-bold text-red-900">{totalRetired} tons CO₂</p>
            </div>
            <div>
              <p className="text-red-600">Retirement Events</p>
              <p className="text-2xl font-bold text-red-900">{retirements.length}</p>
            </div>
          </div>
        </div>

        {retirements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🌍</div>
            <p className="text-gray-500">No retirements yet</p>
            <p className="text-sm text-gray-400 mt-1">Retire credits to offset your carbon footprint</p>
          </div>
        ) : (
          <div className="space-y-4">
            {retirements.map((retirement) => (
              <div key={retirement.id.toString()} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">Retirement #{retirement.id.toString()}</h3>
                    <p className="text-sm text-gray-600">
                      Batch #{retirement.batchId} • {formatDate(retirement.tsNs)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-red-600">{retirement.amount.toString()} tons CO₂</p>
                    <p className="text-xs text-gray-500">Permanently Retired</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Reason:</span> {retirement.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
