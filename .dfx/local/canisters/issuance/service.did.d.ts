import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Issuance {
  'getBalance' : ActorMethod<[Principal], bigint>,
  'mint' : ActorMethod<[bigint], undefined>,
  'myBalance' : ActorMethod<[], bigint>,
}
export interface _SERVICE extends Issuance {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
