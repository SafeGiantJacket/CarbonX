import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Listing {
  'seller' : Principal,
  'price' : bigint,
  'amount' : bigint,
}
export interface Marketplace {
  'buy' : ActorMethod<[bigint, bigint], undefined>,
  'getListings' : ActorMethod<[], Array<Listing>>,
  'list' : ActorMethod<[bigint, bigint], bigint>,
}
export interface _SERVICE extends Marketplace {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
