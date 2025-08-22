"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MarketplaceScreenProps {
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

interface CreditBatch {
  id: number
  projectId: string
  standard: string
  vintage: number
  royalty_ppm: number
  tags: string[]
}

export const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ actor, currentPrincipal }) => {
  const [listings, setListings] = useState<Listing[]>([])
  const [holdings, setHoldings] = useState<BalanceView[]>([])
  const [batches, setBatches] = useState<CreditBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"browse" | "create" | "my-listings">("browse")

  // Create listing form
  const [createForm, setCreateForm] = useState({
    batchId: "",
    amount: "",
    price: "",
  })

  // Partial buy form
  const [partialBuyForm, setPartialBuyForm] = useState({
    listingId: "",
    amount: "",
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [listingsResult, holdingsResult, batchesResult] = await Promise.all([
        actor.listOpenListings(),
        actor.myHoldings([]),
        actor.listBatches(),
      ])
      setListings(listingsResult)
      setHoldings(holdingsResult)
      setBatches(batchesResult)
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
      const priceE8s = BigInt(Math.floor(Number.parseFloat(createForm.price) * 100000000))
      await actor.createListing(Number.parseInt(createForm.batchId), BigInt(createForm.amount), priceE8s)
      setCreateForm({ batchId: "", amount: "", price: "" })
      await loadData()
      alert("Listing created successfully!")
    } catch (error) {
      console.error("Failed to create listing:", error)
      alert(`Failed to create listing: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyFull = async (listingId: number) => {
    try {
      setLoading(true)
      await actor.buy(listingId)
      await loadData()
      alert("Purchase completed successfully!")
    } catch (error) {
      console.error("Failed to buy listing:", error)
      alert(`Failed to buy listing: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyPartial = async (listingId: number, amount: string) => {
    if (!amount) return
    try {
      setLoading(true)
      await actor.buyPartial(listingId, BigInt(amount))
      await loadData()
      alert("Partial purchase completed successfully!")
    } catch (error) {
      console.error("Failed to buy partial:", error)
      alert(`Failed to buy partial: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelListing = async (listingId: number) => {
    try {
      setLoading(true)
      await actor.cancelListing(listingId)
      await loadData()
      alert("Listing cancelled successfully!")
    } catch (error) {
      console.error("Failed to cancel listing:", error)
      alert(`Failed to cancel listing: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getBatchInfo = (batchId: number) => {
    return batches.find((batch) => batch.id === batchId)
  }

  const formatPrice = (priceE8s: bigint) => (Number(priceE8s) / 100000000).toFixed(2)
  const formatAmount = (amount: bigint) => Number(amount).toLocaleString()
  const formatDate = (nanoseconds: bigint) => {
    const milliseconds = Number(nanoseconds / BigInt(1000000))
    return new Date(milliseconds).toLocaleDateString()
  }

  const isMyListing = (listing: Listing) => listing.seller === currentPrincipal
  const myListings = listings.filter(isMyListing)

  const calculateRoyalty = (listing: Listing) => {
    const batch = getBatchInfo(listing.batchId)
    if (!batch) return "0.00"
    const totalPrice = (Number(listing.amount) * Number(listing.price_e8s)) / 100000000
    const royalty = (totalPrice * Number(batch.royalty_ppm)) / 1000000
    return royalty.toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: "browse", label: "Browse Marketplace", icon: "🏪" },
          { id: "create", label: "Create Listing", icon: "➕" },
          { id: "my-listings", label: "My Listings", icon: "📋" },
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

      {/* Browse Marketplace Tab */}
      {activeTab === "browse" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>🏪</span>
                <span>Carbon Credit Marketplace</span>
              </div>
              <Button onClick={loadData} disabled={loading} variant="outline" size="sm">
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏪</div>
                <p className="text-muted-foreground">No active listings</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to create a listing</p>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => {
                  const batch = getBatchInfo(listing.batchId)
                  const royalty = calculateRoyalty(listing)
                  return (
                    <div
                      key={listing.id}
                      className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">Listing #{listing.id}</h3>
                            {isMyListing(listing) && <Badge variant="outline">My Listing</Badge>}
                            {batch && <Badge variant="secondary">{batch.standard}</Badge>}
                          </div>
                          <p className="text-muted-foreground">
                            Batch #{listing.batchId} - {batch?.projectId || "Unknown Project"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{formatPrice(listing.price_e8s)} ICP</p>
                          <p className="text-sm text-muted-foreground">per ton CO₂</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount Available</p>
                          <p className="font-semibold text-secondary">{formatAmount(listing.amount)} tons</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Value</p>
                          <p className="font-semibold">
                            {(Number(listing.amount) * Number.parseFloat(formatPrice(listing.price_e8s))).toFixed(2)}{" "}
                            ICP
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Royalty Fee</p>
                          <p className="font-semibold text-chart-2">{royalty} ICP</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Listed</p>
                          <p className="font-semibold">{formatDate(listing.createdAtNs)}</p>
                        </div>
                      </div>

                      {batch?.tags && batch.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {batch.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          Seller: {listing.seller.slice(0, 8)}...{listing.seller.slice(-4)}
                        </div>

                        <div className="flex space-x-2">
                          {isMyListing(listing) ? (
                            <Button
                              onClick={() => handleCancelListing(listing.id)}
                              disabled={loading}
                              variant="destructive"
                              size="sm"
                            >
                              Cancel Listing
                            </Button>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  className="w-24 h-8"
                                  max={Number(listing.amount)}
                                  min="1"
                                  onChange={(e) =>
                                    setPartialBuyForm({ ...partialBuyForm, listingId: listing.id.toString() })
                                  }
                                />
                                <Button
                                  onClick={() => {
                                    const input = document.querySelector(
                                      `input[placeholder="Amount"]`,
                                    ) as HTMLInputElement
                                    if (input?.value) {
                                      handleBuyPartial(listing.id, input.value)
                                    }
                                  }}
                                  disabled={loading}
                                  variant="outline"
                                  size="sm"
                                >
                                  Buy Partial
                                </Button>
                              </div>
                              <Button onClick={() => handleBuyFull(listing.id)} disabled={loading} size="sm">
                                Buy All
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Listing Tab */}
      {activeTab === "create" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>➕</span>
              <span>Create New Listing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateListing} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Batch</label>
                  <Select
                    value={createForm.batchId}
                    onValueChange={(value) => setCreateForm({ ...createForm, batchId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {holdings.map((holding) => {
                        const batch = getBatchInfo(holding.batchId)
                        return (
                          <SelectItem key={holding.batchId} value={holding.batchId.toString()}>
                            Batch #{holding.batchId} - {batch?.projectId} ({formatAmount(holding.amount)} tons)
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount (tons CO₂)</label>
                  <Input
                    type="number"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    placeholder="100"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (ICP per ton)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                    placeholder="12.50"
                    min="0.01"
                  />
                </div>
              </div>

              {createForm.batchId && createForm.amount && createForm.price && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Listing Preview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Value:</span>
                      <span className="ml-2 font-semibold">
                        {(Number(createForm.amount) * Number.parseFloat(createForm.price)).toFixed(2)} ICP
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estimated Royalty:</span>
                      <span className="ml-2 font-semibold text-chart-2">
                        {(() => {
                          const batch = getBatchInfo(Number(createForm.batchId))
                          if (!batch) return "0.00"
                          const totalPrice = Number(createForm.amount) * Number.parseFloat(createForm.price)
                          const royalty = (totalPrice * Number(batch.royalty_ppm)) / 1000000
                          return royalty.toFixed(2)
                        })()} ICP
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating Listing..." : "Create Listing"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Listings Tab */}
      {activeTab === "my-listings" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📋</span>
              <span>My Active Listings ({myListings.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-muted-foreground">No active listings</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first listing to start selling</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((listing) => {
                  const batch = getBatchInfo(listing.batchId)
                  return (
                    <div key={listing.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">Listing #{listing.id}</h3>
                          <p className="text-muted-foreground">
                            Batch #{listing.batchId} - {batch?.projectId}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-semibold">{formatAmount(listing.amount)} tons</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-semibold">{formatPrice(listing.price_e8s)} ICP/ton</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Value</p>
                          <p className="font-semibold">
                            {(Number(listing.amount) * Number.parseFloat(formatPrice(listing.price_e8s))).toFixed(2)}{" "}
                            ICP
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Listed: {formatDate(listing.createdAtNs)}</span>
                        <Button
                          onClick={() => handleCancelListing(listing.id)}
                          disabled={loading}
                          variant="destructive"
                          size="sm"
                        >
                          Cancel Listing
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
