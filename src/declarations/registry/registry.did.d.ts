import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Project {
  'id' : bigint,
  'owner' : Principal,
  'metadata' : string,
  'name' : string,
  'createdAt' : bigint,
}
export interface _SERVICE {
  'deleteProject' : ActorMethod<[bigint], boolean>,
  'getAllProjects' : ActorMethod<[], Array<Project>>,
  'getProject' : ActorMethod<[bigint], [] | [Project]>,
  'registerProject' : ActorMethod<[string, string], bigint>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
