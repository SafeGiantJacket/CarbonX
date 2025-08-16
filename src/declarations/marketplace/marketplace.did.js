export const idlFactory = ({ IDL }) => {
  const Listing = IDL.Record({
    'id' : IDL.Nat,
    'pricePerUnit' : IDL.Nat,
    'seller' : IDL.Principal,
    'amount' : IDL.Nat,
  });
  const Marketplace = IDL.Service({
    'buy' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Bool], []),
    'getListing' : IDL.Func([IDL.Nat], [IDL.Opt(Listing)], ['query']),
    'getListings' : IDL.Func([], [IDL.Vec(Listing)], ['query']),
    'list' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], []),
  });
  return Marketplace;
};
export const init = ({ IDL }) => { return []; };
