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
  };

  stable var retiredCredits : [Retired] = [];

  // Retire credits permanently
  public shared({ caller }) func retireCredit(
    id : Text,
    amount : Nat,
    metadata : Text,
    timestamp : Nat
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
    };

    retiredCredits := Array.append<Retired>(retiredCredits, [entry]);
    return true;
  };

  // Query retired by ID
  public query func getRetired(id : Text) : async ?Retired {
    Array.find<Retired>(retiredCredits, func(r) = r.id == id)
  };

  // List all retired credits
  public query func listRetired() : async [Retired] {
    retiredCredits
  };
}
