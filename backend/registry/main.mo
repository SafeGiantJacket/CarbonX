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
    deleted : Bool;
  };

  type BatchHistory = {
    id : Text;
    event : Text;
    timestamp : Nat;
    details : Text;
  };

  stable var batches : [Batch] = [];
  stable var history : [BatchHistory] = [];

  // Register batch into registry
  public shared({ caller }) func registerBatch(
    id : Text,
    amount : Nat,
    metadata : Text,
    timestamp : Nat
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
      deleted = false;
    };

    batches := Array.append<Batch>(batches, [batch]);
    history := Array.append<BatchHistory>(history, [{
      id = id;
      event = "registered";
      timestamp = timestamp;
      details = "Registered by " # Principal.toText(caller);
    }]);
    return true;
  };

  public query func getBatch(id : Text) : async ?Batch {
    Array.find<Batch>(batches, func(b) = b.id == id)
  };

  // Update batch metadata
  public shared({ caller }) func updateBatchMetadata(id : Text, metadata : Text, timestamp : Nat) : async Bool {
    switch (Array.find<Batch>(batches, func(b) = b.id == id)) {
      case null { false };
      case (?batch) {
        if (batch.owner != caller or batch.deleted) return false;
        batches := Array.map<Batch, Batch>(batches, func(b) {
          if (b.id == id) { { b with metadata = metadata } } else { b }
        });
        history := Array.append<BatchHistory>(history, [{
          id = id;
          event = "metadata_updated";
          timestamp = timestamp;
          details = "Metadata updated by " # Principal.toText(caller);
        }]);
        true
      }
    }
  };

  // Delete batch
  public shared({ caller }) func deleteBatch(id : Text, timestamp : Nat) : async Bool {
    switch (Array.find<Batch>(batches, func(b) = b.id == id)) {
      case null { false };
      case (?batch) {
        if (batch.owner != caller or batch.deleted) return false;
        batches := Array.map<Batch, Batch>(batches, func(b) {
          if (b.id == id) { { b with deleted = true } } else { b }
        });
        history := Array.append<BatchHistory>(history, [{
          id = id;
          event = "deleted";
          timestamp = timestamp;
          details = "Deleted by " # Principal.toText(caller);
        }]);
        true
      }
    }
  };

  public query func listBatches() : async [Batch] {
    batches
  };

  // List non-deleted batches
  public query func listActiveBatches() : async [Batch] {
    Array.filter<Batch>(batches, func(b) = not b.deleted)
  };

  // List batches by owner
  public query func listBatchesByOwner(owner : Principal) : async [Batch] {
    Array.filter<Batch>(batches, func(b) = b.owner == owner and not b.deleted)
  };

  // Get batch history
  public query func getBatchHistory(id : Text) : async [BatchHistory] {
    Array.filter<BatchHistory>(history, func(h) = h.id == id)
  };

  public shared({ caller }) func transferBatch(
    id : Text,
    newOwner : Principal,
    timestamp : Nat
  ) : async Bool {
    switch (Array.find<Batch>(batches, func(b) = b.id == id)) {
      case null { false };
      case (?batch) {
        if (batch.owner != caller or batch.deleted) return false;
        batches := Array.map<Batch, Batch>(
          batches,
          func(b) { if (b.id == id) { { b with owner = newOwner } } else { b } }
        );
        history := Array.append<BatchHistory>(history, [{
          id = id;
          event = "transferred";
          timestamp = timestamp;
          details = "Transferred from " # Principal.toText(caller) # " to " # Principal.toText(newOwner);
        }]);
        true
      };
    }
  };
}
