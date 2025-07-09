import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

actor class Retirement() = this {

  // ---- TYPES ----
  type RetirementRecord = {
    user: Principal;
    amount: Nat;
    timestamp: Nat;
    reason: Text;
  };

  // ---- STORAGE ----
  let records = Buffer.Buffer<RetirementRecord>(0);

  // ---- ISSUANCE CANISTER ----
  let issuance = actor "uxrrr-q7777-77774-qaaaq-cai" : actor {
    deduct: (from: Principal, amount: Nat) -> async Bool;
  };

  // ---- RETIRE TOKENS ----
  public shared ({ caller }) func retire(amount: Nat, reason: Text) : async Bool {
    if (amount == 0) return false;

    let success = await issuance.deduct(caller, amount);
    if (success) {
      let record: RetirementRecord = {
        user = caller;
        amount = amount;
        timestamp = Nat64.toNat(Nat64.fromIntWrap(Time.now()));
        reason = reason;
      };
      records.add(record);
      return true;
    };
    return false;
  };

  // ---- QUERY ALL RETIREMENTS ----
  public query func getAllRetirements() : async [RetirementRecord] {
    Buffer.toArray(records);
  };

  // ---- QUERY USER'S RETIREMENTS ----
  public query func getUserRetirements(user: Principal) : async [RetirementRecord] {
    Array.filter<RetirementRecord>(
      Buffer.toArray(records),
      func(r) { r.user == user }
    );
  };

  // ---- (Optional) GET MY RECORDS ----
  public shared ({ caller }) func getMyRetirements() : async [RetirementRecord] {
    await getUserRetirements(caller);
  };
};
