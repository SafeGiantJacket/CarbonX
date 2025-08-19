import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Listing {
  'id' : string,
  'active' : boolean,
  'seller' : Principal,
  'price' : bigint,
  'creditId' : string,
}
export interface _SERVICE {
  'createListing' : ActorMethod<[string, string, bigint], boolean>,
  'deactivateListing' : ActorMethod<[string], boolean>,
  'getListing' : ActorMethod<[string], [] | [Listing]>,
  'listActive' : ActorMethod<[], Array<Listing>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
