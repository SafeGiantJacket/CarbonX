"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface AdminPanelProps {
  actor: any
  currentPrincipal: string
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ actor, currentPrincipal }) => {
  const [owner, setOwner] = useState<string>("")
  const [issuers, setIssuers] = useState<string[]>([])
  const [verifiers, setVerifiers] = useState<string[]>([])
  const [newIssuer, setNewIssuer] = useState("")
  const [newVerifier, setNewVerifier] = useState("")
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [ownerResult, issuersResult, verifiersResult] = await Promise.all([
        actor.getOwner(),
        actor.listIssuers(),
        actor.listVerifiers(),
      ])
      setOwner(ownerResult.toString())
      setIssuers(issuersResult.map((p: any) => p.toString()))
      setVerifiers(verifiersResult.map((p: any) => p.toString()))
    } catch (error) {
      console.error("Failed to load admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [actor])

  const handleAddIssuer = async () => {
    if (!newIssuer.trim()) return
    try {
      setLoading(true)
      await actor.addIssuer(newIssuer)
      setNewIssuer("")
      await loadData()
    } catch (error) {
      console.error("Failed to add issuer:", error)
      alert("Failed to add issuer: " + error)
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
      await loadData()
    } catch (error) {
      console.error("Failed to add verifier:", error)
      alert("Failed to add verifier: " + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Administration</h2>

        {/* Owner Info */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Owner</label>
          <div className="bg-gray-50 p-3 rounded-md">
            <code className="text-sm text-gray-800">{owner}</code>
          </div>
        </div>

        {/* Add Issuer */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add New Issuer</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newIssuer}
              onChange={(e) => setNewIssuer(e.target.value)}
              placeholder="Principal ID"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddIssuer}
              disabled={loading || !newIssuer.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Add Issuer
            </button>
          </div>
        </div>

        {/* Add Verifier */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add New Verifier</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newVerifier}
              onChange={(e) => setNewVerifier(e.target.value)}
              placeholder="Principal ID"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddVerifier}
              disabled={loading || !newVerifier.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Add Verifier
            </button>
          </div>
        </div>

        {/* Current Issuers */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-2">Current Issuers ({issuers.length})</h3>
          <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
            {issuers.length === 0 ? (
              <p className="text-sm text-gray-500">No issuers added</p>
            ) : (
              <ul className="space-y-1">
                {issuers.map((issuer, index) => (
                  <li key={index} className="text-sm font-mono text-gray-700">
                    {issuer}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Current Verifiers */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-2">Current Verifiers ({verifiers.length})</h3>
          <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
            {verifiers.length === 0 ? (
              <p className="text-sm text-gray-500">No verifiers added</p>
            ) : (
              <ul className="space-y-1">
                {verifiers.map((verifier, index) => (
                  <li key={index} className="text-sm font-mono text-gray-700">
                    {verifier}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
    </div>
  )
}
