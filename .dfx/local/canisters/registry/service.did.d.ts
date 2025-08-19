import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Batch {
  'id' : string,
  'creator' : Principal,
  'owner' : Principal,
  'metadata' : string,
  'amount' : bigint,
}
export interface _SERVICE {
  'getBatch' : ActorMethod<[string], [] | [Batch]>,
  'listBatches' : ActorMethod<[], Array<Batch>>,
  'registerBatch' : ActorMethod<[string, bigint, string], boolean>,
  'transferBatch' : ActorMethod<[string, Principal], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
