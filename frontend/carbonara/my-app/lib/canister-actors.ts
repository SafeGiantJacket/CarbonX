import { Actor, HttpAgent } from "@dfinity/agent";

// Utility to create a Motoko canister actor for a given canisterId and idlFactory
export const createCanisterActor = async (canisterId: string, idlFactory: any) => {
  const agent = new HttpAgent({
    host: process.env.NODE_ENV === "development" ? "http://localhost:4943" : "https://ic0.app",
  })
  if (process.env.NODE_ENV === "development") {
    await agent.fetchRootKey()
  }
  return Actor.createActor(idlFactory, { agent, canisterId })
}

// Issuance
export const issuanceIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    issueCredit: IDL.Func([IDL.Text, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat], [IDL.Bool], []),
    updateCreditMetadata: IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [IDL.Bool], []),
    revokeCredit: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    getCredit: IDL.Func([IDL.Text], [IDL.Opt(IDL.Record({
      id: IDL.Text,
      creator: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      revoked: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionAvailable: IDL.Nat,
    }))], ["query"]),
    listCredits: IDL.Func([], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      creator: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      revoked: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionAvailable: IDL.Nat,
    }))], ["query"]),
    listActiveCredits: IDL.Func([], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      creator: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      revoked: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionAvailable: IDL.Nat,
    }))], ["query"]),
    getCreditHistory: IDL.Func([IDL.Text], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      event: IDL.Text,
      timestamp: IDL.Nat,
      details: IDL.Text,
    }))], ["query"]),
  })
}

// Marketplace
export const marketplaceIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    createListing: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat], [IDL.Bool], []),
    updatePrice: IDL.Func([IDL.Text, IDL.Nat, IDL.Nat], [IDL.Bool], []),
    purchaseFraction: IDL.Func([IDL.Text, IDL.Nat, IDL.Nat], [IDL.Bool], []),
    getListing: IDL.Func([IDL.Text], [IDL.Opt(IDL.Record({
      id: IDL.Text,
      seller: IDL.Principal,
      price: IDL.Nat,
      creditId: IDL.Text,
      active: IDL.Bool,
      royaltyPercent: IDL.Nat,
      buyer: IDL.Opt(IDL.Principal),
      fractionAvailable: IDL.Nat,
      fractionTotal: IDL.Nat,
    }))], ["query"]),
    listActive: IDL.Func([], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      seller: IDL.Principal,
      price: IDL.Nat,
      creditId: IDL.Text,
      active: IDL.Bool,
      royaltyPercent: IDL.Nat,
      buyer: IDL.Opt(IDL.Principal),
      fractionAvailable: IDL.Nat,
      fractionTotal: IDL.Nat,
    }))], ["query"]),
    listAllListings: IDL.Func([], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      seller: IDL.Principal,
      price: IDL.Nat,
      creditId: IDL.Text,
      active: IDL.Bool,
      royaltyPercent: IDL.Nat,
      buyer: IDL.Opt(IDL.Principal),
      fractionAvailable: IDL.Nat,
      fractionTotal: IDL.Nat,
    }))], ["query"]),
    listBySeller: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      seller: IDL.Principal,
      price: IDL.Nat,
      creditId: IDL.Text,
      active: IDL.Bool,
      royaltyPercent: IDL.Nat,
      buyer: IDL.Opt(IDL.Principal),
      fractionAvailable: IDL.Nat,
      fractionTotal: IDL.Nat,
    }))], ["query"]),
    listByBuyer: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      seller: IDL.Principal,
      price: IDL.Nat,
      creditId: IDL.Text,
      active: IDL.Bool,
      royaltyPercent: IDL.Nat,
      buyer: IDL.Opt(IDL.Principal),
      fractionAvailable: IDL.Nat,
      fractionTotal: IDL.Nat,
    }))], ["query"]),
    getListingHistory: IDL.Func([IDL.Text], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      event: IDL.Text,
      timestamp: IDL.Nat,
      details: IDL.Text,
    }))], ["query"]),
    deactivateListing: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  })
}

// Registry
export const registryIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    registerBatch: IDL.Func([IDL.Text, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat], [IDL.Bool], []),
    updateBatchMetadata: IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [IDL.Bool], []),
    deleteBatch: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    getBatch: IDL.Func([IDL.Text], [IDL.Opt(IDL.Record({
      id: IDL.Text,
      owner: IDL.Principal,
      creator: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      deleted: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionAvailable: IDL.Nat,
    }))], ["query"]),
    listBatches: IDL.Func([], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      owner: IDL.Principal,
      creator: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      deleted: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionAvailable: IDL.Nat,
    }))], ["query"]),
    listActiveBatches: IDL.Func([], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      owner: IDL.Principal,
      creator: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      deleted: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionAvailable: IDL.Nat,
    }))], ["query"]),
    listBatchesByOwner: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      owner: IDL.Principal,
      creator: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      deleted: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionAvailable: IDL.Nat,
    }))], ["query"]),
    getBatchHistory: IDL.Func([IDL.Text], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      event: IDL.Text,
      timestamp: IDL.Nat,
      details: IDL.Text,
    }))], ["query"]),
    transferBatch: IDL.Func([IDL.Text, IDL.Principal, IDL.Nat], [IDL.Bool], []),
  })
}

// Retirement
export const retirementIdlFactory = ({ IDL }: any) => {
  return IDL.Service({
    retireCredit: IDL.Func([IDL.Text, IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text], [IDL.Bool], []),
    undoRetirement: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    getRetired: IDL.Func([IDL.Text], [IDL.Opt(IDL.Record({
      id: IDL.Text,
      owner: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      timestamp: IDL.Nat,
      reason: IDL.Text,
      undone: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionRetired: IDL.Nat,
    }))], ["query"]),
    listRetired: IDL.Func([], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      owner: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      timestamp: IDL.Nat,
      reason: IDL.Text,
      undone: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionRetired: IDL.Nat,
    }))], ["query"]),
    listActiveRetired: IDL.Func([], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      owner: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      timestamp: IDL.Nat,
      reason: IDL.Text,
      undone: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionRetired: IDL.Nat,
    }))], ["query"]),
    listRetiredByOwner: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      owner: IDL.Principal,
      amount: IDL.Nat,
      metadata: IDL.Text,
      timestamp: IDL.Nat,
      reason: IDL.Text,
      undone: IDL.Bool,
      fractionTotal: IDL.Nat,
      fractionRetired: IDL.Nat,
    }))], ["query"]),
    getRetirementHistory: IDL.Func([IDL.Text], [IDL.Vec(IDL.Record({
      id: IDL.Text,
      event: IDL.Text,
      timestamp: IDL.Nat,
      details: IDL.Text,
    }))], ["query"]),
  })
}
