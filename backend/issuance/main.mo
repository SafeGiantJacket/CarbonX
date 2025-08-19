import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor Issuance {

  type Credit = {
    id : Text;
    creator : Principal;
    amount : Nat;
    metadata : Text;
  };

  stable var credits : [Credit] = [];

  // Issue a new carbon credit batch
  public shared({ caller }) func issueCredit(
    id : Text,
    amount : Nat,
    metadata : Text
  ) : async Bool {
    if (Array.find<Credit>(credits, func(c) = c.id == id) != null) {
      return false;
    };

    let credit : Credit = {
      id = id;
      creator = caller;
      amount = amount;
      metadata = metadata;
    };

    credits := Array.append<Credit>(credits, [credit]);
    return true;
  };

  // Query single credit
  public query func getCredit(id : Text) : async ?Credit {
    Array.find<Credit>(credits, func(c) = c.id == id)
  };

  // List all credits
  public query func listCredits() : async [Credit] {
    credits
  };
}
