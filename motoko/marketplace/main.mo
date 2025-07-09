import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";

actor class Marketplace() = this {

  type Listing = {
    seller: Principal;
    amount: Nat;
    price: Nat;
  };

  let listings = HashMap.HashMap<Nat, Listing>(10, Nat.equal, Int.hash);
  var nextId : Nat = 0;

  // LINK TO ISSUANCE
  let issuance = actor "uxrrr-q7777-77774-qaaaq-cai" : actor {
    mint : (to: Principal, amount: Nat) -> async ();
    deduct : (from: Principal, amount: Nat) -> async Bool;
  };

  public func list(amount: Nat, price: Nat) : async Nat {
    let caller = Principal.fromActor(this); // simulate caller
    let id = nextId;
    listings.put(id, {
      seller = caller;
      amount = amount;
      price = price;
    });
    nextId += 1;
    return id;
  };

  public query func getListings() : async [Listing] {
    return Iter.toArray(listings.vals());
  };

  public func buy(id: Nat, quantity: Nat) : async () {
    let buyer = Principal.fromActor(this); // simulate caller
    switch (listings.get(id)) {
      case null return;
      case (?l) {
        if (quantity > l.amount) return;

        // Perform cross-canister calls
        let deducted = await issuance.deduct(l.seller, quantity);
        if (deducted == false) return;

        await issuance.mint(buyer, quantity);

        // Update listing
        if (quantity == l.amount) {
          listings.delete(id);
        } else {
          listings.put(id, {
            seller = l.seller;
            amount = l.amount - quantity;
            price = l.price;
          });
        };
      };
    };
  };
};
