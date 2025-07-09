import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";

actor class Issuance() = this {

  let balances = HashMap.HashMap<Principal, Nat>(100, Principal.equal, Principal.hash);

  public shared ({ caller }) func mint(to: Principal, amount: Nat) : async () {
    let current = balances.get(to);
    let newBalance = switch current {
      case (?val) val + amount;
      case null amount;
    };
    balances.put(to, newBalance);
  };

  public shared ({ caller }) func mintToCaller(amount: Nat) : async () {
    await mint(caller, amount);
  };

  public shared ({ caller }) func deduct(from: Principal, amount: Nat) : async Bool {
    switch (balances.get(from)) {
      case (?val) {
        if (val >= amount) {
          balances.put(from, val - amount);
          return true;
        } else {
          return false;
        };
      };
      case null return false;
    }
  };

  public query func getBalance(user: Principal) : async Nat {
    switch (balances.get(user)) {
      case (?val) val;
      case null 0;
    }
  };

  public shared ({ caller }) func getMyBalance() : async Nat {
    await getBalance(caller);
  };
};
