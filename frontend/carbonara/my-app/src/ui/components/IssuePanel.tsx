"use client"

import type React from "react"
import { useState } from "react"

interface IssuePanelProps {
  actor: any
  currentPrincipal: string
}

export const IssuePanel: React.FC<IssuePanelProps> = ({ actor, currentPrincipal }) => {
  const [formData, setFormData] = useState({
    projectId: "",
    standard: "VCS",
    vintage: new Date().getFullYear(),
    totalSupply: "",
    metadata: "",
    tags: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.projectId || !formData.totalSupply) return

    try {
      setLoading(true)
      setResult(null)

      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
      const batchId = await actor.issueBatch(
        formData.projectId,
        formData.standard,
        formData.vintage,
        BigInt(formData.totalSupply),
        formData.metadata,
        tags,
      )

      setResult(`Successfully issued batch with ID: ${batchId}`)
      setFormData({
        projectId: "",
        standard: "VCS",
        vintage: new Date().getFullYear(),
        totalSupply: "",
        metadata: "",
        tags: "",
      })
    } catch (error) {
      console.error("Failed to issue batch:", error)
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue New Carbon Credit Batch</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project ID *</label>
            <input
              type="text"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              placeholder="e.g., FOREST-001"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
            <select
              value={formData.standard}
              onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="VCS">VCS (Verified Carbon Standard)</option>
              <option value="CDM">CDM (Clean Development Mechanism)</option>
              <option value="GS">Gold Standard</option>
              <option value="CAR">Climate Action Reserve</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vintage Year</label>
            <input
              type="number"
              value={formData.vintage}
              onChange={(e) => setFormData({ ...formData, vintage: Number.parseInt(e.target.value) })}
              min="2000"
              max={new Date().getFullYear()}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Supply (tons CO₂) *</label>
            <input
              type="number"
              value={formData.totalSupply}
              onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
              placeholder="1000"
              min="1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metadata (JSON or URL)</label>
            <textarea
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              placeholder='{"location": "Brazil", "methodology": "REDD+"}'
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="forestry, REDD+, biodiversity"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.projectId || !formData.totalSupply}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Issuing Batch..." : "Issue Carbon Credit Batch"}
          </button>
        </form>

        {result && (
          <div
            className={`mt-4 p-3 rounded-md ${result.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
          >
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
