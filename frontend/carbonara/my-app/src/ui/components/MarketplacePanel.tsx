"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface MarketplacePanelProps {
  actor: any
  currentPrincipal: string
}

interface Listing {
  id: number
  batchId: number
  seller: string
  amount: bigint
  price_e8s: bigint
  createdAtNs: bigint
  open: boolean
}

interface BalanceView {
  batchId: number
  amount: bigint
}

export const MarketplacePanel: React.FC<MarketplacePanelProps> = ({ actor, currentPrincipal }) => {
  const [listings, setListings] = useState<Listing[]>([])
  const [holdings, setHoldings] = useState<BalanceView[]>([])
  const [loading, setLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    batchId: "",
    amount: "",
    price: "",
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [listingsResult, holdingsResult] = await Promise.all([actor.listOpenListings(), actor.myHoldings([])])
      setListings(listingsResult)
      setHoldings(holdingsResult)
    } catch (error) {
      console.error("Failed to load marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [actor])

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.batchId || !createForm.amount || !createForm.price) return

    try {
      setLoading(true)
      const priceE8s = BigInt(Math.floor(Number.parseFloat(createForm.price) * 100000000)) // Convert to e8s
      await actor.createListing(Number.parseInt(createForm.batchId), BigInt(createForm.amount), priceE8s)
      setCreateForm({ batchId: "", amount: "", price: "" })
      await loadData()
    } catch (error) {
      console.error("Failed to create listing:", error)
      alert("Failed to create listing: " + error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (listingId: number) => {
    try {
      setLoading(true)
      await actor.buy(listingId)
      await loadData()
    } catch (error) {
      console.error("Failed to buy listing:", error)
      alert("Failed to buy listing: " + error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (listingId: number) => {
    try {
      setLoading(true)
      await actor.cancelListing(listingId)
      await loadData()
    } catch (error) {
      console.error("Failed to cancel listing:", error)
      alert("Failed to cancel listing: " + error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (priceE8s: bigint) => {
    return (Number(priceE8s) / 100000000).toFixed(2)
  }

  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleDateString()
  }

  const isMyListing = (listing: Listing) => {
    return listing.seller === currentPrincipal
  }

  return (
    <div className="space-y-6">
      {/* Create Listing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Listing</h2>

        <form onSubmit={handleCreateListing} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
            <select
              value={createForm.batchId}
              onChange={(e) => setCreateForm({ ...createForm, batchId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">Select batch</option>
              {holdings.map((holding) => (
                <option key={holding.batchId} value={holding.batchId}>
                  Batch #{holding.batchId} ({holding.amount.toString()} tons)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (tons)</label>
            <input
              type="number"
              value={createForm.amount}
              onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
              placeholder="100"
              min="1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (ICP per ton)</label>
            <input
              type="number"
              step="0.01"
              value={createForm.price}
              onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
              placeholder="10.00"
              min="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              List for Sale
            </button>
          </div>
        </form>
      </div>

      {/* Active Listings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Marketplace Listings</h2>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🏪</div>
            <p className="text-gray-500">No active listings</p>
            <p className="text-sm text-gray-400 mt-1">Create a listing to start trading</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        Listing #{listing.id} - Batch #{listing.batchId}
                      </h3>
                      {isMyListing(listing) && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">My Listing</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 font-medium">{listing.amount.toString()} tons CO₂</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="ml-2 font-medium">{formatPrice(listing.price_e8s)} ICP/ton</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-2 font-medium">
                          {(Number(listing.amount) * Number.parseFloat(formatPrice(listing.price_e8s))).toFixed(2)} ICP
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Listed:</span>
                        <span className="ml-2">{formatDate(listing.createdAtNs)}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Seller: <code>{listing.seller}</code>
                    </div>
                  </div>

                  <div className="ml-4 flex space-x-2">
                    {isMyListing(listing) ? (
                      <button
                        onClick={() => handleCancel(listing.id)}
                        disabled={loading}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(listing.id)}
                        disabled={loading}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
