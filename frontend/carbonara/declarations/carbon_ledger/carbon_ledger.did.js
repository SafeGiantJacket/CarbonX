export const idlFactory = ({ IDL }) => {
  const BatchId = IDL.Nat32
  const ListingId = IDL.Nat32

  const CreditBatch = IDL.Record({
    id: BatchId,
    projectId: IDL.Text,
    standard: IDL.Text,
    vintage: IDL.Nat16,
    totalSupply: IDL.Nat,
    available: IDL.Nat,
    metadata: IDL.Text,
    issuer: IDL.Principal,
    createdAtNs: IDL.Nat64,
    tags: IDL.Vec(IDL.Text),
  })

  const BalanceView = IDL.Record({
    batchId: BatchId,
    amount: IDL.Nat,
  })

  const Listing = IDL.Record({
    id: ListingId,
    batchId: BatchId,
    seller: IDL.Principal,
    amount: IDL.Nat,
    price_e8s: IDL.Nat,
    createdAtNs: IDL.Nat64,
    open: IDL.Bool,
  })

  const Retirement = IDL.Record({
    id: IDL.Nat64,
    batchId: BatchId,
    owner: IDL.Principal,
    amount: IDL.Nat,
    reason: IDL.Text,
    tsNs: IDL.Nat64,
  })

  const AuditEvent = IDL.Record({
    tsNs: IDL.Nat64,
    actor: IDL.Principal,
    action: IDL.Text,
    details: IDL.Text,
  })

  return IDL.Service({
    // Admin & Roles
    getOwner: IDL.Func([], [IDL.Principal], ["query"]),
    setOwner: IDL.Func([IDL.Principal], [], []),
    addIssuer: IDL.Func([IDL.Principal], [], []),
    addVerifier: IDL.Func([IDL.Principal], [], []),
    listIssuers: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    listVerifiers: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),

    // Batches & Issuance
    issueBatch: IDL.Func([IDL.Text, IDL.Text, IDL.Nat16, IDL.Nat, IDL.Text, IDL.Vec(IDL.Text)], [BatchId], []),
    getBatch: IDL.Func([BatchId], [IDL.Opt(CreditBatch)], ["query"]),
    listBatches: IDL.Func([], [IDL.Vec(CreditBatch)], ["query"]),
    mintTo: IDL.Func([BatchId, IDL.Principal, IDL.Nat], [], []),
    balanceOf: IDL.Func([BatchId, IDL.Principal], [IDL.Nat], ["query"]),
    myHoldings: IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Vec(BalanceView)], ["query"]),
    scanAllBalances: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Tuple(BatchId, IDL.Principal), IDL.Nat))], ["query"]),

    // Marketplace
    createListing: IDL.Func([BatchId, IDL.Nat, IDL.Nat], [ListingId], []),
    cancelListing: IDL.Func([ListingId], [], []),
    buy: IDL.Func([ListingId], [], []),
    listOpenListings: IDL.Func([], [IDL.Vec(Listing)], ["query"]),

    // Retirement
    retire: IDL.Func([BatchId, IDL.Nat, IDL.Text], [IDL.Nat64], []),
    myRetirements: IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Vec(Retirement)], ["query"]),

    // Audit & Governance
    auditLog: IDL.Func([IDL.Opt(IDL.Nat64)], [IDL.Vec(AuditEvent)], ["query"]),
    verifyBatch: IDL.Func([BatchId, IDL.Text], [], []),
    flagBatch: IDL.Func([BatchId, IDL.Text], [], []),
  })
}

export const init = ({ IDL }) => {
  return []
}

export default { idlFactory, init }
