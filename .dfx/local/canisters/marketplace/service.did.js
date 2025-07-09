export const idlFactory = ({ IDL }) => {
  const Listing = IDL.Record({
    'seller' : IDL.Principal,
    'price' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const Marketplace = IDL.Service({
    'buy' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'getListings' : IDL.Func([], [IDL.Vec(Listing)], ['query']),
    'list' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], []),
  });
  return Marketplace;
};
export const init = ({ IDL }) => { return []; };
