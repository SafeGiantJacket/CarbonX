"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface AuditPanelProps {
  actor: any
  currentPrincipal: string
}

interface AuditEvent {
  tsNs: bigint
  actor: string
  action: string
  details: string
}

export const AuditPanel: React.FC<AuditPanelProps> = ({ actor, currentPrincipal }) => {
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [autoExport, setAutoExport] = useState(false)
  const [exportStatus, setExportStatus] = useState<string>("")

  const loadAuditLog = async () => {
    try {
      setLoading(true)
      const auditResult = await actor.auditLog([])
      setAuditLog(auditResult)
    } catch (error) {
      console.error("Failed to load audit log:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLog()
  }, [actor])

  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleString()
  }

  const exportToAI = async () => {
    try {
      setLoading(true)
      setExportStatus("Exporting to AI system...")

      const exportData = {
        type: "auditSnapshot",
        canisterId: process.env.VITE_LEDGER_CANISTER_ID,
        timestamp: Date.now(),
        audit: auditLog.map((event) => ({
          timestamp: Number(event.tsNs),
          actor: event.actor,
          action: event.action,
          details: event.details,
        })),
      }

      // Simulate AI API call (replace with actual endpoint)
      const response = await fetch("/ai/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData),
      })

      if (response.ok) {
        setExportStatus("Successfully exported to AI system")
      } else {
        setExportStatus("AI export failed - endpoint not configured")
      }
    } catch (error) {
      console.error("AI export failed:", error)
      setExportStatus("AI export failed - check configuration")
    } finally {
      setLoading(false)
      setTimeout(() => setExportStatus(""), 3000)
    }
  }

  const downloadAuditLog = () => {
    const csvContent = [
      "Timestamp,Actor,Action,Details",
      ...auditLog.map((event) => `"${formatDate(event.tsNs)}","${event.actor}","${event.action}","${event.details}"`),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `carbon-ledger-audit-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "issuebatch":
        return "bg-green-100 text-green-800"
      case "mintto":
        return "bg-blue-100 text-blue-800"
      case "transfer":
        return "bg-purple-100 text-purple-800"
      case "createlisting":
        return "bg-yellow-100 text-yellow-800"
      case "buy":
        return "bg-orange-100 text-orange-800"
      case "retire":
        return "bg-red-100 text-red-800"
      case "verifybatch":
        return "bg-teal-100 text-teal-800"
      case "flagbatch":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Log & AI Integration</h2>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          <button
            onClick={loadAuditLog}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Log"}
          </button>

          <button
            onClick={downloadAuditLog}
            disabled={auditLog.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Download CSV
          </button>

          <button
            onClick={exportToAI}
            disabled={loading || auditLog.length === 0}
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            Export to AI
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoExport"
              checked={autoExport}
              onChange={(e) => setAutoExport(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="autoExport" className="text-sm text-gray-700">
              Auto-export to AI
            </label>
          </div>
        </div>

        {exportStatus && (
          <div
            className={`p-3 rounded-md text-sm ${
              exportStatus.includes("Successfully") ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {exportStatus}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">Total Events</p>
            <p className="text-xl font-semibold text-gray-900">{auditLog.length}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">Unique Actors</p>
            <p className="text-xl font-semibold text-gray-900">{new Set(auditLog.map((e) => e.actor)).size}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">Action Types</p>
            <p className="text-xl font-semibold text-gray-900">{new Set(auditLog.map((e) => e.action)).size}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">Latest Event</p>
            <p className="text-sm font-medium text-gray-900">
              {auditLog.length > 0 ? formatDate(auditLog[auditLog.length - 1].tsNs) : "None"}
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Transaction History</h3>

        {auditLog.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-500">No audit events recorded</p>
            <p className="text-sm text-gray-400 mt-1">System activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {auditLog
              .slice()
              .reverse()
              .map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(event.action)}`}>
                        {event.action}
                      </span>
                      <span className="text-sm text-gray-600">{formatDate(event.tsNs)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-1">{event.details}</div>

                  <div className="text-xs text-gray-500 font-mono">Actor: {event.actor}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
