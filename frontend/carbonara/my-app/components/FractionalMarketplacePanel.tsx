import React, { useState } from "react"
import { createCanisterActor, issuanceIdlFactory, marketplaceIdlFactory, registryIdlFactory, retirementIdlFactory } from "../lib/canister-actors"

// Example canister IDs (replace with actual deployed IDs)
const ISSUANCE_ID = "<issuance-canister-id>"
const MARKETPLACE_ID = "<marketplace-canister-id>"
const REGISTRY_ID = "<registry-canister-id>"
const RETIREMENT_ID = "<retirement-canister-id>"

export function FractionalMarketplacePanel() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fractionBuy, setFractionBuy] = useState(1)
  const [selectedListing, setSelectedListing] = useState<string>("")
  const [message, setMessage] = useState("")

  // Load active listings from marketplace
  const loadListings = async () => {
    setLoading(true)
    const actor = await createCanisterActor(MARKETPLACE_ID, marketplaceIdlFactory)
    const data = await actor.listActive()
    setListings(data)
    setLoading(false)
  }

  // Buy a fraction of a listing
  const buyFraction = async () => {
    if (!selectedListing || fractionBuy < 1) return
    setLoading(true)
    const actor = await createCanisterActor(MARKETPLACE_ID, marketplaceIdlFactory)
    // Use current timestamp for demo
    const timestamp = Math.floor(Date.now() / 1000)
    const result = await actor.purchaseFraction(selectedListing, fractionBuy, timestamp)
    setMessage(result ? "Purchase successful!" : "Purchase failed.")
    setLoading(false)
    loadListings()
  }

  React.useEffect(() => {
    loadListings()
  }, [])

  return (
    <div>
      <h2>Fractional Marketplace</h2>
      {loading && <div>Loading...</div>}
      <ul>
        {listings.map((listing: any) => (
          <li key={listing.id}>
            <strong>{listing.id}</strong> | Credit: {listing.creditId} | Price: {listing.price} | Available: {listing.fractionAvailable}/{listing.fractionTotal}
            <button onClick={() => setSelectedListing(listing.id)}>Select</button>
          </li>
        ))}
      </ul>
      {selectedListing && (
        <div>
          <h3>Buy Fraction</h3>
          <input type="number" min={1} value={fractionBuy} onChange={e => setFractionBuy(Number(e.target.value))} />
          <button onClick={buyFraction}>Buy</button>
        </div>
      )}
      {message && <div>{message}</div>}
    </div>
  )
}
