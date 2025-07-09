import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";

actor class Issuance() = this {

  // Tracks balances of carbon credits per user
  let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);

  // Mint credits to the caller
  public func mint(amount: Nat) : async () {
    let caller = Principal.fromActor(this);
    let current = balances.get(caller);
    let newBalance = switch current {
      case (?val) val + amount;
      case null amount;
    };
    balances.put(caller, newBalance);
  };

  // Query credit balance for any user
  public query func getBalance(user: Principal) : async Nat {
    switch (balances.get(user)) {
      case (?val) val;
      case null 0;
    }
  };

  // Query caller's own balance
  public query func myBalance() : async Nat {
    let caller = Principal.fromActor(this);
    switch (balances.get(caller)) {
      case (?val) val;
      case null 0;
    }
  };
};
