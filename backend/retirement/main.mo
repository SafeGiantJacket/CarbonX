import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor Retirement {

  type Retired = {
    id : Text;
    owner : Principal;
    amount : Nat;
    metadata : Text;
    timestamp : Nat;
    reason : Text;
    undone : Bool;
    fractionTotal : Nat;
    fractionRetired : Nat;
  };

  type RetirementHistory = {
    id : Text;
    event : Text;
    timestamp : Nat;
    details : Text;
  };

  stable var retiredCredits : [Retired] = [];
  stable var history : [RetirementHistory] = [];

  // Retire credits permanently
  public shared({ caller }) func retireCredit(
    id : Text,
    amount : Nat,
    metadata : Text,
    fractionTotal : Nat,
    fractionRetired : Nat,
    timestamp : Nat,
    reason : Text
  ) : async Bool {
    if (Array.find<Retired>(retiredCredits, func(r) = r.id == id) != null) {
      return false;
    };

    let entry : Retired = {
      id = id;
      owner = caller;
      amount = amount;
      metadata = metadata;
      timestamp = timestamp;
      reason = reason;
      undone = false;
      fractionTotal = fractionTotal;
      fractionRetired = fractionRetired;
    };

    retiredCredits := Array.append<Retired>(retiredCredits, [entry]);
    history := Array.append<RetirementHistory>(history, [{
      id = id;
      event = "retired";
      timestamp = timestamp;
      details = "Retired by " # Principal.toText(caller) # ", Reason: " # reason # ", Fraction: " # Nat.toText(fractionRetired) # "/" # Nat.toText(fractionTotal);
    }]);
    return true;
  };

  // Query retired by ID
  public query func getRetired(id : Text) : async ?Retired {
    Array.find<Retired>(retiredCredits, func(r) = r.id == id)
  };

  // Undo retirement
  public shared({ caller }) func undoRetirement(id : Text, timestamp : Nat) : async Bool {
    switch (Array.find<Retired>(retiredCredits, func(r) = r.id == id)) {
      case null { false };
      case (?retired) {
        if (retired.owner != caller or retired.undone) return false;
        retiredCredits := Array.map<Retired, Retired>(retiredCredits, func(r) {
          if (r.id == id) { { r with undone = true } } else { r }
        });
        history := Array.append<RetirementHistory>(history, [{
          id = id;
          event = "undone";
          timestamp = timestamp;
          details = "Retirement undone by " # Principal.toText(caller);
        }]);
        true
      }
    }
  };

  // List all retired credits
  public query func listRetired() : async [Retired] {
    retiredCredits
  };

  // List active retirements
  public query func listActiveRetired() : async [Retired] {
    Array.filter<Retired>(retiredCredits, func(r) = not r.undone)
  };

  // List retirements by owner
  public query func listRetiredByOwner(owner : Principal) : async [Retired] {
    Array.filter<Retired>(retiredCredits, func(r) = r.owner == owner and not r.undone)
  };

  // Get retirement history
  public query func getRetirementHistory(id : Text) : async [RetirementHistory] {
    Array.filter<RetirementHistory>(history, func(h) = h.id == id)
  };
}
