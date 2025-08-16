export const idlFactory = ({ IDL }) => {
  const RetirementRecord = IDL.Record({
    'user' : IDL.Principal,
    'timestamp' : IDL.Nat,
    'amount' : IDL.Nat,
    'reason' : IDL.Text,
  });
  const Retirement = IDL.Service({
    'getAllRetirements' : IDL.Func([], [IDL.Vec(RetirementRecord)], ['query']),
    'getMyRetirements' : IDL.Func([], [IDL.Vec(RetirementRecord)], []),
    'getUserRetirements' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(RetirementRecord)],
        ['query'],
      ),
    'retire' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Bool], []),
  });
  return Retirement;
};
export const init = ({ IDL }) => { return []; };
