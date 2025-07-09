export const idlFactory = ({ IDL }) => {
  const Project = IDL.Record({
    'id' : IDL.Nat,
    'owner' : IDL.Principal,
    'metadata' : IDL.Text,
    'name' : IDL.Text,
    'createdAt' : IDL.Nat,
  });
  return IDL.Service({
    'deleteProject' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getAllProjects' : IDL.Func([], [IDL.Vec(Project)], ['query']),
    'getProject' : IDL.Func([IDL.Nat], [IDL.Opt(Project)], ['query']),
    'registerProject' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
  });
};
export const init = ({ IDL }) => { return []; };
