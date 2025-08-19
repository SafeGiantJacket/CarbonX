import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Credit {
  'id' : string,
  'creator' : Principal,
  'metadata' : string,
  'amount' : bigint,
}
export interface _SERVICE {
  'getCredit' : ActorMethod<[string], [] | [Credit]>,
  'issueCredit' : ActorMethod<[string, bigint, string], boolean>,
  'listCredits' : ActorMethod<[], Array<Credit>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
