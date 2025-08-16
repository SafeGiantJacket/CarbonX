export const idlFactory = ({ IDL }) => {
  const Issuance = IDL.Service({
    'deduct' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], []),
    'getBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getMyBalance' : IDL.Func([], [IDL.Nat], []),
    'mint' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'mintToCaller' : IDL.Func([IDL.Nat], [], []),
  });
  return Issuance;
};
export const init = ({ IDL }) => { return []; };
