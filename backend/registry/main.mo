import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor Registry {

  type Batch = {
    id : Text;
    owner : Principal;
    creator : Principal;
    amount : Nat;
    metadata : Text;
  };

  stable var batches : [Batch] = [];

  // Register batch into registry
  public shared({ caller }) func registerBatch(
    id : Text,
    amount : Nat,
    metadata : Text
  ) : async Bool {
    if (Array.find<Batch>(batches, func(b) = b.id == id) != null) {
      return false;
    };

    let batch : Batch = {
      id = id;
      owner = caller;
      creator = caller;
      amount = amount;
      metadata = metadata;
    };

    batches := Array.append<Batch>(batches, [batch]);
    return true;
  };

  public query func getBatch(id : Text) : async ?Batch {
    Array.find<Batch>(batches, func(b) = b.id == id)
  };

  public query func listBatches() : async [Batch] {
    batches
  };

  public shared({ caller }) func transferBatch(
    id : Text,
    newOwner : Principal
  ) : async Bool {
    switch (Array.find<Batch>(batches, func(b) = b.id == id)) {
      case null { false };
      case (?batch) {
        if (batch.owner != caller) return false;
        batches := Array.map<Batch, Batch>(
          batches,
          func(b) { if (b.id == id) { { b with owner = newOwner } } else { b } }
        );
        true
      };
    }
  };
}
