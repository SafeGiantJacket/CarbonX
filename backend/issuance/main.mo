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
    revoked : Bool;
  };

  type CreditHistory = {
    id : Text;
    event : Text;
    timestamp : Nat;
    details : Text;
  };

  stable var credits : [Credit] = [];
  stable var history : [CreditHistory] = [];

  // Issue a new carbon credit batch
  public shared({ caller }) func issueCredit(
    id : Text,
    amount : Nat,
    metadata : Text,
    timestamp : Nat
  ) : async Bool {
    if (Array.find<Credit>(credits, func(c) = c.id == id) != null) {
      return false;
    };

    let credit : Credit = {
      id = id;
      creator = caller;
      amount = amount;
      metadata = metadata;
      revoked = false;
    };

    credits := Array.append<Credit>(credits, [credit]);
    history := Array.append<CreditHistory>(history, [{
      id = id;
      event = "issued";
      timestamp = timestamp;
      details = "Issued by " # Principal.toText(caller);
    }]);
    return true;
  };

  // Query single credit
  public query func getCredit(id : Text) : async ?Credit {
    Array.find<Credit>(credits, func(c) = c.id == id)
  };

  // Update credit metadata
  public shared({ caller }) func updateCreditMetadata(id : Text, metadata : Text, timestamp : Nat) : async Bool {
    switch (Array.find<Credit>(credits, func(c) = c.id == id)) {
      case null { false };
      case (?credit) {
        if (credit.creator != caller or credit.revoked) return false;
        credits := Array.map<Credit, Credit>(credits, func(c) {
          if (c.id == id) { { c with metadata = metadata } } else { c }
        });
        history := Array.append<CreditHistory>(history, [{
          id = id;
          event = "metadata_updated";
          timestamp = timestamp;
          details = "Metadata updated by " # Principal.toText(caller);
        }]);
        true
      }
    }
  };

  // Revoke credit
  public shared({ caller }) func revokeCredit(id : Text, timestamp : Nat) : async Bool {
    switch (Array.find<Credit>(credits, func(c) = c.id == id)) {
      case null { false };
      case (?credit) {
        if (credit.creator != caller or credit.revoked) return false;
        credits := Array.map<Credit, Credit>(credits, func(c) {
          if (c.id == id) { { c with revoked = true } } else { c }
        });
        history := Array.append<CreditHistory>(history, [{
          id = id;
          event = "revoked";
          timestamp = timestamp;
          details = "Revoked by " # Principal.toText(caller);
        }]);
        true
      }
    }
  };

  // List all credits
  public query func listCredits() : async [Credit] {
    credits
  };

  // List non-revoked credits
  public query func listActiveCredits() : async [Credit] {
    Array.filter<Credit>(credits, func(c) = not c.revoked)
  };

  // Get credit history
  public query func getCreditHistory(id : Text) : async [CreditHistory] {
    Array.filter<CreditHistory>(history, func(h) = h.id == id)
  };
}
