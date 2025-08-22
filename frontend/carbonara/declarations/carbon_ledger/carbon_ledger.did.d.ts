import type { Principal } from "@dfinity/principal"
import type { ActorMethod } from "@dfinity/agent"

export type AuditEvent = {
  tsNs: bigint
  actor: Principal
  action: string
  details: string
}
export type BalanceView = { batchId: BatchId; amount: bigint }
export type BatchId = number
export type BatchStatus = { Unverified: null } | { Verified: null } | { Flagged: null } | { Suspended: null }
export type CreditBatch = {
  id: BatchId
  projectId: string
  standard: string
  vintage: number
  totalSupply: bigint
  available: bigint
  metadata: string
  issuer: Principal
  createdAtNs: bigint
  tags: Array<string>
  royalty_ppm: bigint
}
export type Listing = {
  id: ListingId
  batchId: BatchId
  seller: Principal
  amount: bigint
  price_e8s: bigint
  createdAtNs: bigint
  open: boolean
}
export type ListingId = number
export type Retirement = {
  id: bigint
  batchId: BatchId
  owner: Principal
  amount: bigint
  reason: string
  tsNs: bigint
}

export interface _SERVICE {
  addIssuer: ActorMethod<[Principal], undefined>
  addOracle: ActorMethod<[Principal], undefined>
  addVerifier: ActorMethod<[Principal], undefined>
  appendMetadataVersion: ActorMethod<[BatchId, string], undefined>
  auditLog: ActorMethod<[[] | [bigint]], Array<AuditEvent>>
  balanceOf: ActorMethod<[BatchId, Principal], bigint>
  buy: ActorMethod<[ListingId], undefined>
  buyPartial: ActorMethod<[ListingId, bigint], undefined>
  cancelListing: ActorMethod<[ListingId], undefined>
  createListing: ActorMethod<[BatchId, bigint, bigint], ListingId>
  flagBatch: ActorMethod<[BatchId, string], undefined>
  getBatch: ActorMethod<[BatchId], [] | [CreditBatch]>
  getBatchStatus: ActorMethod<[BatchId], [] | [BatchStatus]>
  getMetadataHistory: ActorMethod<[BatchId], [] | [Array<string>]>
  getOwner: ActorMethod<[], Principal>
  ingestOracleEvent: ActorMethod<[Principal, string], undefined>
  issueBatch: ActorMethod<[string, string, number, bigint, string, Array<string>, bigint], BatchId>
  listBatches: ActorMethod<[], Array<CreditBatch>>
  listByTag: ActorMethod<[string], Array<CreditBatch>>
  listIssuers: ActorMethod<[], Array<Principal>>
  listOpenListings: ActorMethod<[], Array<Listing>>
  listOracles: ActorMethod<[], Array<Principal>>
  listVerifiers: ActorMethod<[], Array<Principal>>
  myHoldings: ActorMethod<[[] | [Principal]], Array<BalanceView>>
  myRetirements: ActorMethod<[[] | [Principal]], Array<Retirement>>
  portfolioTotal: ActorMethod<[[] | [Principal]], bigint>
  retire: ActorMethod<[BatchId, bigint, string], bigint>
  setBatchStatus: ActorMethod<[BatchId, BatchStatus], undefined>
  setOwner: ActorMethod<[Principal], undefined>
  transfer: ActorMethod<[BatchId, Principal, bigint], undefined>
  verifyBatch: ActorMethod<[BatchId, string], undefined>
}
