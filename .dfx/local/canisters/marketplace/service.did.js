export const idlFactory = ({ IDL }) => {
  const Listing = IDL.Record({
    'id' : IDL.Text,
    'active' : IDL.Bool,
    'seller' : IDL.Principal,
    'price' : IDL.Nat,
    'creditId' : IDL.Text,
  });
  return IDL.Service({
    'createListing' : IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [IDL.Bool], []),
    'deactivateListing' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getListing' : IDL.Func([IDL.Text], [IDL.Opt(Listing)], ['query']),
    'listActive' : IDL.Func([], [IDL.Vec(Listing)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
