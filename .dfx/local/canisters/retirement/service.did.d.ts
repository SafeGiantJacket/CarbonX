import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Retired {
  'id' : string,
  'owner' : Principal,
  'metadata' : string,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface _SERVICE {
  'getRetired' : ActorMethod<[string], [] | [Retired]>,
  'listRetired' : ActorMethod<[], Array<Retired>>,
  'retireCredit' : ActorMethod<[string, bigint, string, bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
