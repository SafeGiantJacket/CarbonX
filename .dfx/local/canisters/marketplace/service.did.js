export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'ping' : IDL.Func([], [IDL.Text], ['query']) });
};
export const init = ({ IDL }) => { return []; };
