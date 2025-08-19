export const idlFactory = ({ IDL }) => {
  const Batch = IDL.Record({
    'id' : IDL.Text,
    'creator' : IDL.Principal,
    'owner' : IDL.Principal,
    'metadata' : IDL.Text,
    'amount' : IDL.Nat,
  });
  return IDL.Service({
    'getBatch' : IDL.Func([IDL.Text], [IDL.Opt(Batch)], ['query']),
    'listBatches' : IDL.Func([], [IDL.Vec(Batch)], ['query']),
    'registerBatch' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [IDL.Bool], []),
    'transferBatch' : IDL.Func([IDL.Text, IDL.Principal], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
