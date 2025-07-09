import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";

actor class Marketplace() = this {

  // ---- TYPES ----
  type Listing = {
    id: Nat;
    seller: Principal;
    amount: Nat;
    pricePerUnit: Nat; // price per 1 credit
  };

  // ---- STORAGE ----
  let listings = HashMap.HashMap<Nat, Listing>(100, Nat.equal, Int.hash);
  var nextId : Nat = 0;

  // ---- ISSUANCE CANISTER LINK ----
  let issuance = actor "uxrrr-q7777-77774-qaaaq-cai" : actor {
    mint : (to: Principal, amount: Nat) -> async ();
    deduct : (from: Principal, amount: Nat) -> async Bool;
  };

  // ---- LISTING CREDITS ----
  public shared ({ caller }) func list(amount: Nat, pricePerUnit: Nat) : async Nat {
    assert amount > 0;
    assert pricePerUnit > 0;

    let id = nextId;
    listings.put(id, {
      id = id;
      seller = caller;
      amount = amount;
      pricePerUnit = pricePerUnit;
    });
    nextId += 1;
    return id;
  };

  // ---- VIEW LISTINGS ----
  public query func getListings() : async [Listing] {
    Iter.toArray(listings.vals());
  };

  public query func getListing(id: Nat) : async ?Listing {
    listings.get(id);
  };

  // ---- BUY FROM LISTING ----
  public shared ({ caller }) func buy(id: Nat, quantity: Nat) : async Bool {
    switch (listings.get(id)) {
      case null return false;

      case (?l) {
        if (quantity == 0 or quantity > l.amount) return false;
        if (caller == l.seller) return false;

        let totalCost = quantity * l.pricePerUnit;

        // Deduct tokens from buyer
        let deducted = await issuance.deduct(caller, totalCost);
        if (!deducted) return false;

        // Mint tokens to seller
        await issuance.mint(l.seller, totalCost);

        // Update or remove listing
        if (quantity == l.amount) {
          listings.delete(id);
        } else {
          listings.put(id, {
            id = l.id;
            seller = l.seller;
            amount = l.amount - quantity;
            pricePerUnit = l.pricePerUnit;
          });
        };

        return true;
      };
    };
  };
};
