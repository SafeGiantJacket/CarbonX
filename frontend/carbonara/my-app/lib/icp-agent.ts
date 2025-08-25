import { Actor, HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import type { Principal } from "@dfinity/principal"
import type { Message, UserProfile, CanisterStatus } from "./types"

// Canister interface definition matching our Motoko canister
export interface CanisterInterface {
  greet: (name: string) => Promise<string>
  get_message: () => Promise<string>
  set_message: (message: string) => Promise<void>
  get_all_messages: () => Promise<Message[]>
  get_message_by_id: (id: bigint) => Promise<Message | undefined>
  create_message: (content: string, author: string) => Promise<bigint>
  update_message: (id: bigint, content: string) => Promise<boolean>
  delete_message: (id: bigint) => Promise<boolean>
  get_user_profile: (principal: string) => Promise<UserProfile | undefined>
  create_user_profile: (principal: string, name: string | undefined) => Promise<boolean>
  update_user_profile: (principal: string, name: string | undefined) => Promise<boolean>
  get_canister_status: () => Promise<CanisterStatus>
  init: () => Promise<void>
}

// Development canister ID (placeholder - replace with actual deployed canister ID)
const CANISTER_ID = "rdmx6-jaaaa-aaaah-qcaiq-cai"

// IDL factory for the canister matching our Motoko interface
const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    greet: IDL.Func([IDL.Text], [IDL.Text], ["query"]),
    get_message: IDL.Func([], [IDL.Text], ["query"]),
    set_message: IDL.Func([IDL.Text], [], []),
    get_all_messages: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Record({
            id: IDL.Nat,
            content: IDL.Text,
            author: IDL.Text,
            timestamp: IDL.Int,
          }),
        ),
      ],
      ["query"],
    ),
    get_message_by_id: IDL.Func(
      [IDL.Nat],
      [
        IDL.Opt(
          IDL.Record({
            id: IDL.Nat,
            content: IDL.Text,
            author: IDL.Text,
            timestamp: IDL.Int,
          }),
        ),
      ],
      ["query"],
    ),
    create_message: IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    update_message: IDL.Func([IDL.Nat, IDL.Text], [IDL.Bool], []),
    delete_message: IDL.Func([IDL.Nat], [IDL.Bool], []),
    get_user_profile: IDL.Func(
      [IDL.Text],
      [
        IDL.Opt(
          IDL.Record({
            principal: IDL.Text,
            name: IDL.Opt(IDL.Text),
            created_at: IDL.Int,
          }),
        ),
      ],
      ["query"],
    ),
    create_user_profile: IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [IDL.Bool], []),
    update_user_profile: IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [IDL.Bool], []),
    get_canister_status: IDL.Func(
      [],
      [
        IDL.Record({
          message_count: IDL.Nat,
          user_count: IDL.Nat,
          global_message: IDL.Text,
        }),
      ],
      ["query"],
    ),
    init: IDL.Func([], [], []),
  })
}

let agent: HttpAgent | null = null
let actor: any = null

export const initializeAgent = async (): Promise<HttpAgent> => {
  if (!agent) {
    agent = new HttpAgent({
      host: process.env.NODE_ENV === "development" ? "http://localhost:4943" : "https://ic0.app",
    })

    // Fetch root key for local development
    if (process.env.NODE_ENV === "development") {
      await agent.fetchRootKey()
    }
  }
  return agent
}

export const createActor = async (): Promise<CanisterInterface> => {
  if (!actor) {
    const httpAgent = await initializeAgent()
    actor = Actor.createActor(idlFactory, {
      agent: httpAgent,
      canisterId: CANISTER_ID,
    })
  }
  return actor
}

export const handleCanisterCall = async <T>(\
  call: () => Promise<T>\
)
: Promise<CanisterCallResult<T>> =>
{
  try {
    const data = await call()
    return { success: true, data }
  } catch (error: any) {
    console.error("Canister call failed:", error)
    return {
      success: false,
      error: {
        message: error.message || "Unknown canister error",
        code: error.code,
      },
    }
  }
}

export const getAuthClient = async (): Promise<AuthClient> => {
  return await AuthClient.create()
}

export const login = async (): Promise<boolean> => {
  const authClient = await getAuthClient()

  return new Promise((resolve) => {
    authClient.login({
      identityProvider:
        process.env.NODE_ENV === "development"
          ? `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID || "rdmx6-jaaaa-aaaah-qcaiq-cai"}`
          : "https://identity.ic0.app",
      onSuccess: () => resolve(true),
      onError: () => resolve(false),
    })
  })
}

export const logout = async (): Promise<void> => {
  const authClient = await getAuthClient()
  await authClient.logout()
  agent = null
  actor = null
}

export const getPrincipal = async (): Promise<Principal | null> => {
  const authClient = await getAuthClient()
  const identity = authClient.getIdentity()
  return identity.getPrincipal()
}

export const isAuthenticated = async (): Promise<boolean> => {
  const authClient = await getAuthClient()
  return await authClient.isAuthenticated()
}
