import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Retirement {
  'getAllRetirements' : ActorMethod<[], Array<RetirementRecord>>,
  'getUserRetirements' : ActorMethod<[Principal], Array<RetirementRecord>>,
  'retire' : ActorMethod<[bigint, string], boolean>,
}
export interface RetirementRecord {
  'user' : Principal,
  'timestamp' : bigint,
  'amount' : bigint,
  'reason' : string,
}
export interface _SERVICE extends Retirement {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
