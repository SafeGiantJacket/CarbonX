import type { Principal } from "@dfinity/principal"
import type { ActorMethod } from "@dfinity/agent"

export interface AuditEvent {
  tsNs: bigint
  actor: Principal
  action: string
  details: string
}
export interface BalanceView {
  batchId: number
  amount: bigint
}
export type BatchId = number
export interface CreditBatch {
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
}
export interface Listing {
  id: ListingId
  batchId: BatchId
  seller: Principal
  amount: bigint
  price_e8s: bigint
  createdAtNs: bigint
  open: boolean
}
export type ListingId = number
export interface Retirement {
  id: bigint
  batchId: BatchId
  owner: Principal
  amount: bigint
  reason: string
  tsNs: bigint
}
export interface _SERVICE {
  addIssuer: ActorMethod<[Principal], undefined>
  addVerifier: ActorMethod<[Principal], undefined>
  auditLog: ActorMethod<[[] | [bigint]], Array<AuditEvent>>
  balanceOf: ActorMethod<[BatchId, Principal], bigint>
  buy: ActorMethod<[ListingId], undefined>
  cancelListing: ActorMethod<[ListingId], undefined>
  createListing: ActorMethod<[BatchId, bigint, bigint], ListingId>
  flagBatch: ActorMethod<[BatchId, string], undefined>
  getBatch: ActorMethod<[BatchId], [] | [CreditBatch]>
  getOwner: ActorMethod<[], Principal>
  issueBatch: ActorMethod<[string, string, number, bigint, string, Array<string>], BatchId>
  listBatches: ActorMethod<[], Array<CreditBatch>>
  listIssuers: ActorMethod<[], Array<Principal>>
  listOpenListings: ActorMethod<[], Array<Listing>>
  listVerifiers: ActorMethod<[], Array<Principal>>
  mintTo: ActorMethod<[BatchId, Principal, bigint], undefined>
  myHoldings: ActorMethod<[[] | [Principal]], Array<BalanceView>>
  myRetirements: ActorMethod<[[] | [Principal]], Array<Retirement>>
  retire: ActorMethod<[BatchId, bigint, string], bigint>
  scanAllBalances: ActorMethod<[], Array<[[BatchId, Principal], bigint]>>
  setOwner: ActorMethod<[Principal], undefined>
  verifyBatch: ActorMethod<[BatchId, string], undefined>
}
