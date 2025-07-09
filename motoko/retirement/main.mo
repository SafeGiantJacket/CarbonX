import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Nat64 "mo:base/Nat64";

actor class Retirement() = this {

  type RetirementRecord = {
    user: Principal;
    amount: Nat;
    timestamp: Nat;
    reason: Text;
  };

  let records = Buffer.Buffer<RetirementRecord>(0);

  let issuance = actor "uxrrr-q7777-77774-qaaaq-cai" : actor {
    deduct : (from: Principal, amount: Nat) -> async Bool;
  };

  public func retire(amount: Nat, reason: Text) : async Bool {
    let user = Principal.fromActor(this); // TODO: Use real caller
    let success = await issuance.deduct(user, amount);
    if (success) {
      let record : RetirementRecord = {
        user = user;
        amount = amount;
        timestamp = Nat64.toNat(Nat64.fromIntWrap(Time.now()));
        reason = reason;
      };
      records.add(record);
      return true;
    };
    return false;
  };

  public query func getUserRetirements(user: Principal) : async [RetirementRecord] {
    Array.filter<RetirementRecord>(Buffer.toArray<RetirementRecord>(records), func(r) { r.user == user });
  };

  public query func getAllRetirements() : async [RetirementRecord] {
    Buffer.toArray<RetirementRecord>(records);
  };
};
