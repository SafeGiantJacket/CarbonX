export const idlFactory = ({ IDL }) => {
  const Retired = IDL.Record({
    'id' : IDL.Text,
    'owner' : IDL.Principal,
    'metadata' : IDL.Text,
    'timestamp' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  return IDL.Service({
    'getRetired' : IDL.Func([IDL.Text], [IDL.Opt(Retired)], ['query']),
    'listRetired' : IDL.Func([], [IDL.Vec(Retired)], ['query']),
    'retireCredit' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Text, IDL.Nat],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
