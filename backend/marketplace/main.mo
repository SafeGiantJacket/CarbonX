import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor Marketplace {

  type Listing = {
    id : Text;
    seller : Principal;
    price : Nat;
    creditId : Text;
    active : Bool;
  };

  stable var listings : [Listing] = [];

  // Create new listing
  public shared({ caller }) func createListing(
    id : Text,
    creditId : Text,
    price : Nat
  ) : async Bool {
    if (Array.find<Listing>(listings, func(l) = l.id == id) != null) {
      return false;
    };

    let listing : Listing = {
      id = id;
      seller = caller;
      price = price;
      creditId = creditId;
      active = true;
    };

    listings := Array.append<Listing>(listings, [listing]);
    return true;
  };

  // Query single listing
  public query func getListing(id : Text) : async ?Listing {
    Array.find<Listing>(listings, func(l) = l.id == id)
  };

  // List all active listings
  public query func listActive() : async [Listing] {
    Array.filter<Listing>(listings, func(l) = l.active)
  };

  // Mark listing as sold (or deactivate)
  public shared({ caller }) func deactivateListing(id : Text) : async Bool {
    switch (Array.find<Listing>(listings, func(l) = l.id == id)) {
      case null { false };
      case (?listing) {
        if (listing.seller != caller) return false;
        listings := Array.map<Listing, Listing>(
          listings,
          func(l) { if (l.id == id) { { l with active = false } } else { l } }
        );
        true
      };
    }
  };
}
