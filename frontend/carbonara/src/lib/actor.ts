import { Actor, HttpAgent } from "@dfinity/agent"

const CANISTER_ID = process.env.VITE_LEDGER_CANISTER_ID || "rdmx6-jaaaa-aaaah-qdrva-cai"
const DFX_HOST = process.env.VITE_DFX_HOST || "http://127.0.0.1:4943"

const createIdlFactory = ({ IDL }: any) => {
  const BatchId = IDL.Nat32
  const ListingId = IDL.Nat32

  const BatchStatus = IDL.Variant({
    Unverified: IDL.Null,
    Verified: IDL.Null,
    Flagged: IDL.Null,
    Suspended: IDL.Null,
  })

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
    royalty_ppm: IDL.Nat,
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
    addOracle: IDL.Func([IDL.Principal], [], []),
    listIssuers: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    listVerifiers: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),
    listOracles: IDL.Func([], [IDL.Vec(IDL.Principal)], ["query"]),

    // Batches & Issuance with royalty support
    issueBatch: IDL.Func([IDL.Text, IDL.Text, IDL.Nat16, IDL.Nat, IDL.Text, IDL.Vec(IDL.Text), IDL.Nat], [BatchId], []),
    getBatch: IDL.Func([BatchId], [IDL.Opt(CreditBatch)], ["query"]),
    listBatches: IDL.Func([], [IDL.Vec(CreditBatch)], ["query"]),
    mintTo: IDL.Func([BatchId, IDL.Principal, IDL.Nat], [], []),
    balanceOf: IDL.Func([BatchId, IDL.Principal], [IDL.Nat], ["query"]),
    myHoldings: IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Vec(BalanceView)], ["query"]),
    scanAllBalances: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Tuple(BatchId, IDL.Principal), IDL.Nat))], ["query"]),
    transfer: IDL.Func([BatchId, IDL.Principal, IDL.Nat], [], []),

    // Enhanced Marketplace with partial buys
    createListing: IDL.Func([BatchId, IDL.Nat, IDL.Nat], [ListingId], []),
    cancelListing: IDL.Func([ListingId], [], []),
    buy: IDL.Func([ListingId], [], []),
    buyPartial: IDL.Func([ListingId, IDL.Nat], [], []),
    listOpenListings: IDL.Func([], [IDL.Vec(Listing)], ["query"]),

    // Retirement
    retire: IDL.Func([BatchId, IDL.Nat, IDL.Text], [IDL.Nat64], []),
    myRetirements: IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Vec(Retirement)], ["query"]),

    // Enhanced Queries
    listByTag: IDL.Func([IDL.Text], [IDL.Vec(CreditBatch)], ["query"]),
    portfolioTotal: IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Nat], ["query"]),

    // Batch Status & Metadata Versioning
    getBatchStatus: IDL.Func([BatchId], [IDL.Opt(BatchStatus)], ["query"]),
    setBatchStatus: IDL.Func([BatchId, BatchStatus], [], []),
    appendMetadataVersion: IDL.Func([BatchId, IDL.Text], [], []),
    getMetadataHistory: IDL.Func([BatchId], [IDL.Opt(IDL.Vec(IDL.Text))], ["query"]),

    // Audit & Governance
    auditLog: IDL.Func([IDL.Opt(IDL.Nat64)], [IDL.Vec(AuditEvent)], ["query"]),
    verifyBatch: IDL.Func([BatchId, IDL.Text], [], []),
    flagBatch: IDL.Func([BatchId, IDL.Text], [], []),

    // Oracle Integration
    ingestOracleEvent: IDL.Func([IDL.Principal, IDL.Text], [], []),
  })
}

let actor: any = null

const createMockActor = () => {
  return {
    // Admin & Roles
    getOwner: async () => "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
    setOwner: async (principal: string) => null,
    addIssuer: async (principal: string) => null,
    addVerifier: async (principal: string) => null,
    addOracle: async (principal: string) => null,
    listIssuers: async () => ["z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe"],
    listVerifiers: async () => ["z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe"],
    listOracles: async () => ["z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe"],

    // Batches & Issuance with royalty support
    issueBatch: async (
      projectId: string,
      standard: string,
      vintage: number,
      totalSupply: bigint,
      metadata: string,
      tags: string[],
      royalty_ppm: bigint,
    ) => 1,
    getBatch: async (batchId: number) => ({
      id: batchId,
      projectId: "SOLAR-001",
      standard: "VCS",
      vintage: 2024,
      totalSupply: BigInt(10000),
      available: BigInt(7500),
      metadata: JSON.stringify({ project: "Solar Farm Alpha", location: "California", methodology: "ACM0002" }),
      issuer: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
      createdAtNs: BigInt(Date.now() * 1000000),
      tags: ["renewable", "solar", "california"],
      royalty_ppm: BigInt(25000),
    }),
    listBatches: async () => [
      {
        id: 1,
        projectId: "SOLAR-001",
        standard: "VCS",
        vintage: 2024,
        totalSupply: BigInt(10000),
        available: BigInt(7500),
        metadata: JSON.stringify({ project: "Solar Farm Alpha", location: "California", methodology: "ACM0002" }),
        issuer: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        createdAtNs: BigInt(Date.now() * 1000000),
        tags: ["renewable", "solar", "california"],
        royalty_ppm: BigInt(25000),
      },
      {
        id: 2,
        projectId: "WIND-002",
        standard: "CDM",
        vintage: 2024,
        totalSupply: BigInt(15000),
        available: BigInt(12000),
        metadata: JSON.stringify({ project: "Wind Farm Beta", location: "Texas", methodology: "ACM0002" }),
        issuer: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        createdAtNs: BigInt(Date.now() * 1000000),
        tags: ["renewable", "wind", "texas"],
        royalty_ppm: BigInt(30000),
      },
      {
        id: 3,
        projectId: "FOREST-003",
        standard: "VCS",
        vintage: 2023,
        totalSupply: BigInt(25000),
        available: BigInt(18000),
        metadata: JSON.stringify({ project: "Amazon Reforestation", location: "Brazil", methodology: "AR-ACM0003" }),
        issuer: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        createdAtNs: BigInt(Date.now() * 1000000),
        tags: ["forestry", "reforestation", "brazil"],
        royalty_ppm: BigInt(20000),
      },
    ],
    mintTo: async (batchId: number, principal: string, amount: bigint) => null,
    balanceOf: async (batchId: number, principal: string) => BigInt(500),
    myHoldings: async (principal?: string) => [
      { batchId: 1, amount: BigInt(500) },
      { batchId: 2, amount: BigInt(300) },
      { batchId: 3, amount: BigInt(150) },
    ],
    scanAllBalances: async () => [
      [[1, "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe"], BigInt(500)],
      [[2, "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe"], BigInt(300)],
      [[3, "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe"], BigInt(150)],
    ],
    transfer: async (batchId: number, to: string, amount: bigint) => null,

    // Enhanced Marketplace
    createListing: async (batchId: number, amount: bigint, price_e8s: bigint) => 1,
    cancelListing: async (listingId: number) => null,
    buy: async (listingId: number) => null,
    buyPartial: async (listingId: number, amount: bigint) => null,
    listOpenListings: async () => [
      {
        id: 1,
        batchId: 1,
        seller: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        amount: BigInt(1000),
        price_e8s: BigInt(50000000),
        createdAtNs: BigInt(Date.now() * 1000000),
        open: true,
      },
      {
        id: 2,
        batchId: 2,
        seller: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        amount: BigInt(2000),
        price_e8s: BigInt(75000000),
        createdAtNs: BigInt(Date.now() * 1000000),
        open: true,
      },
      {
        id: 3,
        batchId: 3,
        seller: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        amount: BigInt(1500),
        price_e8s: BigInt(60000000),
        createdAtNs: BigInt(Date.now() * 1000000),
        open: true,
      },
    ],

    // Retirement
    retire: async (batchId: number, amount: bigint, reason: string) => BigInt(1),
    myRetirements: async (principal?: string) => [
      {
        id: BigInt(1),
        batchId: 1,
        owner: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        amount: BigInt(100),
        reason: "Corporate carbon neutrality initiative",
        tsNs: BigInt(Date.now() * 1000000),
      },
      {
        id: BigInt(2),
        batchId: 2,
        owner: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        amount: BigInt(50),
        reason: "Annual sustainability report",
        tsNs: BigInt(Date.now() * 1000000 - 86400000),
      },
    ],

    // Enhanced Queries
    listByTag: async (tag: string) => [
      {
        id: 1,
        projectId: "SOLAR-001",
        standard: "VCS",
        vintage: 2024,
        totalSupply: BigInt(10000),
        available: BigInt(7500),
        metadata: JSON.stringify({ project: "Solar Farm Alpha", location: "California" }),
        issuer: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        createdAtNs: BigInt(Date.now() * 1000000),
        tags: ["renewable", "solar", "california"],
        royalty_ppm: BigInt(25000),
      },
    ],
    portfolioTotal: async (principal?: string) => BigInt(950),

    // Batch Status & Metadata Versioning
    getBatchStatus: async (batchId: number) => ({ Verified: null }),
    setBatchStatus: async (batchId: number, status: any) => null,
    appendMetadataVersion: async (batchId: number, newMetadata: string) => null,
    getMetadataHistory: async (batchId: number) => [
      JSON.stringify({ project: "Solar Farm Alpha", location: "California", version: 1 }),
      JSON.stringify({ project: "Solar Farm Alpha", location: "California", methodology: "ACM0002", version: 2 }),
    ],

    // Audit & Governance
    auditLog: async (fromTsNs?: bigint) => [
      {
        tsNs: BigInt(Date.now() * 1000000),
        actor: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        action: "issueBatch",
        details: "batch=1 project=SOLAR-001 royalty_ppm=25000",
      },
      {
        tsNs: BigInt(Date.now() * 1000000 - 3600000),
        actor: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        action: "createListing",
        details: "listing=1 batch=1 amt=1000 price_e8s=50000000",
      },
      {
        tsNs: BigInt(Date.now() * 1000000 - 7200000),
        actor: "z5a6c-zvq4v-sisxj-n4ylv-fb7id-pmoig-lyeqk-435e6-2o3tv-4a2ko-5qe",
        action: "buyPartial",
        details: "listing=1 buyer=xyz amt=500 royalty_e8s=625000",
      },
    ],
    verifyBatch: async (batchId: number, notes: string) => null,
    flagBatch: async (batchId: number, reason: string) => null,

    // Oracle Integration
    ingestOracleEvent: async (source: string, payload: string) => null,
  }
}

export const initActor = async () => {
  if (actor) return actor

  const isPreview =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("v0.dev"))

  if (isPreview) {
    console.log("[v0] Running in preview mode, using mock actor")
    actor = createMockActor()
    return actor
  }

  try {
    const agent = new HttpAgent({ host: DFX_HOST })

    // Fetch root key for local development
    if (DFX_HOST.includes("127.0.0.1") || DFX_HOST.includes("localhost")) {
      await agent.fetchRootKey()
    }

    actor = Actor.createActor(createIdlFactory, {
      agent,
      canisterId: CANISTER_ID,
    })

    return actor
  } catch (error) {
    console.error("Failed to initialize real actor, falling back to mock:", error)
    actor = createMockActor()
    return actor
  }
}

export const getActor = () => actor
