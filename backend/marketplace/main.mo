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
    royaltyPercent : Nat;
    buyer : ?Principal;
    fractionAvailable : Nat;
    fractionTotal : Nat;
  };

  type ListingHistory = {
    id : Text;
    event : Text;
    timestamp : Nat;
    details : Text;
  };

  stable var listings : [Listing] = [];
  stable var history : [ListingHistory] = [];

  // Create new listing
  public shared({ caller }) func createListing(
    id : Text,
    creditId : Text,
    price : Nat,
    royaltyPercent : Nat,
    fractionTotal : Nat,
    timestamp : Nat
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
      royaltyPercent = royaltyPercent;
      buyer = null;
      fractionAvailable = fractionTotal;
      fractionTotal = fractionTotal;
    };

    listings := Array.append<Listing>(listings, [listing]);
    history := Array.append<ListingHistory>(history, [{
      id = id;
      event = "created";
      timestamp = timestamp;
      details = "Listing created by " # Principal.toText(caller);
    }]);
    return true;
  };

  // Query single listing
  public query func getListing(id : Text) : async ?Listing {
    Array.find<Listing>(listings, func(l) = l.id == id)
  };

  // Update price
  public shared({ caller }) func updatePrice(id : Text, newPrice : Nat, timestamp : Nat) : async Bool {
    switch (Array.find<Listing>(listings, func(l) = l.id == id)) {
      case null { false };
      case (?listing) {
        if (listing.seller != caller or not listing.active) return false;
        listings := Array.map<Listing, Listing>(listings, func(l) {
          if (l.id == id) { { l with price = newPrice } } else { l }
        });
        history := Array.append<ListingHistory>(history, [{
          id = id;
          event = "price_updated";
          timestamp = timestamp;
          details = "Price updated by " # Principal.toText(caller);
        }]);
        true
      }
    }
  };

  // Fractional purchase
  public shared({ caller }) func purchaseFraction(id : Text, fraction : Nat, timestamp : Nat) : async Bool {
    switch (Array.find<Listing>(listings, func(l) = l.id == id)) {
      case null { false };
      case (?listing) {
        if (not listing.active or listing.seller == caller or fraction == 0 or fraction > listing.fractionAvailable) return false;
        let price = (listing.price * fraction) / listing.fractionTotal;
        let royalty = (price * listing.royaltyPercent) / 100;
        let platformShare = price - royalty;
        let newFractionAvailable = listing.fractionAvailable - fraction;
        let newActive = newFractionAvailable > 0;
        listings := Array.map<Listing, Listing>(listings, func(l) {
          if (l.id == id) {
            { l with fractionAvailable = newFractionAvailable; active = newActive; buyer = ?caller }
          } else { l }
        });
        history := Array.append<ListingHistory>(history, [{
          id = id;
          event = "fraction_purchased";
          timestamp = timestamp;
          details = "Purchased " # Nat.toText(fraction) # "/" # Nat.toText(listing.fractionTotal) # " by " # Principal.toText(caller) # ", Royalty: " # Nat.toText(royalty) # ", Platform: " # Nat.toText(platformShare);
        }]);
        true
      }
    }
  };

  // List all active listings
  public query func listActive() : async [Listing] {
    Array.filter<Listing>(listings, func(l) = l.active)
  };

  // List all listings
  public query func listAllListings() : async [Listing] {
    listings
  };

  // List by seller
  public query func listBySeller(seller : Principal) : async [Listing] {
    Array.filter<Listing>(listings, func(l) = l.seller == seller)
  };

  // List by buyer
  public query func listByBuyer(buyer : Principal) : async [Listing] {
    Array.filter<Listing>(listings, func(l) = l.buyer == ?buyer)
  };

  // Get listing history
  public query func getListingHistory(id : Text) : async [ListingHistory] {
    Array.filter<ListingHistory>(history, func(h) = h.id == id)
  };

  // Mark listing as sold (or deactivate)
  public shared({ caller }) func deactivateListing(id : Text, timestamp : Nat) : async Bool {
    switch (Array.find<Listing>(listings, func(l) = l.id == id)) {
      case null { false };
      case (?listing) {
        if (listing.seller != caller or not listing.active) return false;
        listings := Array.map<Listing, Listing>(
          listings,
          func(l) { if (l.id == id) { { l with active = false } } else { l } }
        );
        history := Array.append<ListingHistory>(history, [{
          id = id;
          event = "deactivated";
          timestamp = timestamp;
          details = "Deactivated by " # Principal.toText(caller);
        }]);
        true
      };
    }
  };
}
