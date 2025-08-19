export const idlFactory = ({ IDL }) => {
  const Credit = IDL.Record({
    'id' : IDL.Text,
    'creator' : IDL.Principal,
    'metadata' : IDL.Text,
    'amount' : IDL.Nat,
  });
  return IDL.Service({
    'getCredit' : IDL.Func([IDL.Text], [IDL.Opt(Credit)], ['query']),
    'issueCredit' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [IDL.Bool], []),
    'listCredits' : IDL.Func([], [IDL.Vec(Credit)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
