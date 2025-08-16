import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Issuance {
  'deduct' : ActorMethod<[Principal, bigint], boolean>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getMyBalance' : ActorMethod<[], bigint>,
  'mint' : ActorMethod<[Principal, bigint], undefined>,
  'mintToCaller' : ActorMethod<[bigint], undefined>,
}
export interface _SERVICE extends Issuance {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
