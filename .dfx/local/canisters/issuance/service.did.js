export const idlFactory = ({ IDL }) => {
  const Issuance = IDL.Service({
    'getBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'mint' : IDL.Func([IDL.Nat], [], []),
    'myBalance' : IDL.Func([], [IDL.Nat], ['query']),
  });
  return Issuance;
};
export const init = ({ IDL }) => { return []; };
