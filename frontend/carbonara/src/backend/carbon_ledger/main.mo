import Nat       "mo:base/Nat";
import Nat16     "mo:base/Nat16";
import Nat32     "mo:base/Nat32";
import Nat64     "mo:base/Nat64";
import Text      "mo:base/Text";
import Time      "mo:base/Time";
import Iter      "mo:base/Iter";
import HashMap   "mo:base/HashMap";
import Principal "mo:base/Principal";
import Debug     "mo:base/Debug";
import Array     "mo:base/Array";

actor {

  /*
    Carbon Ledger - single canister
    - Modular single-canister design:
      issuance, minting, balances, transfer
      marketplace (list/buy/cancel)
      retirement (burn)
      registry queries
      roles (owner, issuers, verifiers)
      audit log for AI/off-chain consumption
  */

  // ----------------- Admin + Roles -----------------
  // This value will be patched by scripts (or set manually).
  stable var owner : Principal = Principal.fromText("aaaaa-aa"); // patched in setup

  stable var _issuers : [Principal] = [];
  stable var _verifiers : [Principal] = [];

  private func caller() : Principal { Debug.caller() };

  private func assertOwner() {
    assert(Principal.equal(caller(), owner), "caller is not owner");
  };

  public query func getOwner() : async Principal { owner };

  public func setOwner(newOwner : Principal) : async () {
    assertOwner();
    owner := newOwner;
    log("setOwner", "owner changed");
  };

  public func addIssuer(p : Principal) : async () {
    assertOwner();
    if (!isIssuer(p)) _issuers := Array.append(_issuers, [p]);
    log("addIssuer", Principal.toText(p));
  };

  public func addVerifier(p : Principal) : async () {
    assertOwner();
    if (!isVerifier(p)) _verifiers := Array.append(_verifiers, [p]);
    log("addVerifier", Principal.toText(p));
  };

  public query func listIssuers() : async [Principal] { _issuers };
  public query func listVerifiers() : async [Principal] { _verifiers };

  private func isIssuer(p : Principal) : Bool {
    if (Principal.equal(p, owner)) return true;
    for (x in _issuers.vals()) { if (Principal.equal(x, p)) return true };
    false
  };

  private func isVerifier(p : Principal) : Bool {
    if (Principal.equal(p, owner)) return true;
    for (x in _verifiers.vals()) { if (Principal.equal(x, p)) return true };
    false
  };

  // ----------------- Types -----------------
  public type BatchId = Nat32;
  public type ListingId = Nat32;

  public type CreditBatch = {
    id          : BatchId;
    projectId   : Text;
    standard    : Text;
    vintage     : Nat16;
    totalSupply : Nat;
    available   : Nat;
    metadata    : Text;       // JSON or URL
    issuer      : Principal;
    createdAtNs : Nat64;
    tags        : [Text];
  };

  public type BalanceView = {
    batchId : BatchId;
    amount  : Nat;
  };

  public type Listing = {
    id         : ListingId;
    batchId    : BatchId;
    seller     : Principal;
    amount     : Nat;
    price_e8s  : Nat;
    createdAtNs: Nat64;
    open       : Bool;
  };

  public type Retirement = {
    id      : Nat64;
    batchId : BatchId;
    owner   : Principal;
    amount  : Nat;
    reason  : Text;
    tsNs    : Nat64;
  };

  public type AuditEvent = {
    tsNs    : Nat64;
    actor   : Principal;
    action  : Text;
    details : Text;
  };

  // ----------------- Storage -----------------
  stable var nextBatchId : BatchId = 1;
  stable var nextListingId : ListingId = 1;
  stable var nextRetireId : Nat64 = 1;

  stable var _batches_kv : [(BatchId, CreditBatch)] = [];
  let batches = HashMap.HashMap<BatchId, CreditBatch>(64, Nat32.equal, Nat32.hash);

  // balances: (batchId, owner) -> amount
  stable var _balances_kv : [((BatchId, Principal), Nat)] = [];
  let balances = HashMap.HashMap<(BatchId, Principal), Nat>(
    256,
    func (a, b) { a.0 == b.0 and Principal.equal(a.1, b.1) },
    func (k) { Nat32.hash(k.0) ^ Principal.hash(k.1) }
  );

  stable var _listings_kv : [(ListingId, Listing)] = [];
  let listings = HashMap.HashMap<ListingId, Listing>(64, Nat32.equal, Nat32.hash);

  stable var retirements : [Retirement] = [];
  stable var audit : [AuditEvent] = [];

  // ----------------- Lifecycle -----------------
  system func preupgrade() {
    _batches_kv := Iter.toArray(batches.entries());
    _balances_kv := Iter.toArray(balances.entries());
    _listings_kv := Iter.toArray(listings.entries());
  };

  system func postupgrade() {
    for ((k, v) in _batches_kv.vals()) { batches.put(k, v) };
    for ((k, v) in _balances_kv.vals()) { balances.put(k, v) };
    for ((k, v) in _listings_kv.vals()) { listings.put(k, v) };
    _batches_kv := [];
    _balances_kv := [];
    _listings_kv := [];
  };

  // ----------------- Helpers -----------------
  private func nowNs() : Nat64 = Nat64.fromIntWrap(Time.now());

  private func getBal(batchId : BatchId, who : Principal) : Nat {
    switch (balances.get((batchId, who))) { case (?x) x; case null 0 };
  };

  private func setBal(batchId : BatchId, who : Principal, amt : Nat) {
    if (amt == 0) {
      ignore balances.remove((batchId, who));
    } else {
      balances.put((batchId, who), amt);
    };
  };

  private func log(action : Text, details : Text) {
    audit := Array.append(audit, [{
      tsNs = nowNs(); actor = caller(); action = action; details = details
    }]);
  };

  // ----------------- Issuance & Minting -----------------
  public func issueBatch(
    projectId : Text,
    standard  : Text,
    vintage   : Nat16,
    totalSupply : Nat,
    metadata  : Text,
    tags : [Text]
  ) : async BatchId {
    assert(isIssuer(caller()), "not authorized to issue");
    assert(totalSupply > 0, "supply must be > 0");

    let id = nextBatchId; nextBatchId += 1;
    let b : CreditBatch = {
      id = id; projectId = projectId; standard = standard; vintage = vintage;
      totalSupply = totalSupply; available = totalSupply; metadata = metadata;
      issuer = caller(); createdAtNs = nowNs(); tags = tags
    };
    batches.put(id, b);
    log("issueBatch", "id=" # Nat32.toText(id) # " project=" # projectId);
    id
  };

  public func mintTo(batchId : BatchId, to : Principal, amount : Nat) : async () {
    assert(isIssuer(caller()), "not authorized to mint");
    assert(amount > 0, "amount>0");
    let b = switch (batches.get(batchId)) { case (?x) x; case null { assert(false, "batch not found") } };
    assert(b.available >= amount, "not enough available");

    let updated : CreditBatch = {
      id = b.id; projectId = b.projectId; standard = b.standard; vintage = b.vintage;
      totalSupply = b.totalSupply; available = b.available - amount; metadata = b.metadata;
      issuer = b.issuer; createdAtNs = b.createdAtNs; tags = b.tags
    };
    batches.put(batchId, updated);

    let prev = getBal(batchId, to);
    setBal(batchId, to, prev + amount);

    log("mintTo", "batch=" # Nat32.toText(batchId) # " to=" # Principal.toText(to) # " amt=" # Nat.toText(amount));
  };

  // ----------------- Transfer -----------------
  public func transfer(batchId : BatchId, to : Principal, amount : Nat) : async () {
    assert(amount > 0, "amount>0");
    let from = caller();
    let bal = getBal(batchId, from);
    assert(bal >= amount, "insufficient balance");
    setBal(batchId, from, bal - amount);
    setBal(batchId, to, getBal(batchId, to) + amount);
    log("transfer", "batch=" # Nat32.toText(batchId) # " from=" # Principal.toText(from) # " to=" # Principal.toText(to) # " amt=" # Nat.toText(amount));
  };

  public query func myHoldings(who : ?Principal) : async [BalanceView] {
    let p = switch (who) { case (?x) x; case null caller() };
    let arr = Iter.toArray(balances.entries());
    var out : [BalanceView] = [];
    for (((bid, owner), amt) in arr.vals()) {
      if (Principal.equal(owner, p) and amt > 0) {
        out := Array.append(out, [{ batchId = bid; amount = amt }]);
      };
    };
    out
  };

  // ----------------- Marketplace -----------------
  public func createListing(batchId : BatchId, amount : Nat, price_e8s : Nat) : async ListingId {
    assert(amount > 0, "amount>0");
    let seller = caller();
    let bal = getBal(batchId, seller);
    assert(bal >= amount, "insufficient");
    setBal(batchId, seller, bal - amount); // escrow

    let id = nextListingId; nextListingId += 1;
    let l : Listing = {
      id = id; batchId = batchId; seller = seller; amount = amount; price_e8s = price_e8s;
      createdAtNs = nowNs(); open = true
    };
    listings.put(id, l);
    log("createListing", "id=" # Nat32.toText(id));
    id
  };

  public func cancelListing(listingId : ListingId) : async () {
    let l = switch (listings.get(listingId)) { case (?x) x; case null { assert(false, "listing not found") } };
    assert(l.open, "already closed");
    assert(Principal.equal(l.seller, caller()), "not seller");
    // refund
    setBal(l.batchId, l.seller, getBal(l.batchId, l.seller) + l.amount);
    let closed : Listing = { id = l.id; batchId = l.batchId; seller = l.seller; amount = 0; price_e8s = l.price_e8s; createdAtNs = l.createdAtNs; open = false };
    listings.put(listingId, closed);
    log("cancelListing", "id=" # Nat32.toText(listingId));
  };

  public func buy(listingId : ListingId) : async () {
    let l = switch (listings.get(listingId)) { case (?x) x; case null { assert(false, "listing not found") } };
    assert(l.open, "closed");
    // note: payment handling is skipped in MVP—add ICP ledger transfer for production
    let buyer = caller();
    setBal(l.batchId, buyer, getBal(l.batchId, buyer) + l.amount);
    let closed : Listing = { id = l.id; batchId = l.batchId; seller = l.seller; amount = 0; price_e8s = l.price_e8s; createdAtNs = l.createdAtNs; open = false };
    listings.put(listingId, closed);
    log("buy", "listing=" # Nat32.toText(listingId) # " buyer=" # Principal.toText(buyer));
  };

  public query func listOpenListings() : async [Listing] {
    Iter.toArray(Iter.filter(listings.vals(), func (l : Listing) : Bool { l.open }))
  };

  // ----------------- Retirement -----------------
  public func retire(batchId : BatchId, amount : Nat, reason : Text) : async Nat64 {
    assert(amount > 0, "amount>0");
    let p = caller();
    let bal = getBal(batchId, p);
    assert(bal >= amount, "insufficient");
    setBal(batchId, p, bal - amount);

    let id = nextRetireId; nextRetireId += 1;
    retirements := Array.append(retirements, [{
      id = id; batchId = batchId; owner = p; amount = amount; reason = reason; tsNs = nowNs()
    }]);

    log("retire", "retireId=" # Nat64.toText(id) # " batch=" # Nat32.toText(batchId));
    id
  };

  public query func myRetirements(who : ?Principal) : async [Retirement] {
    let p = switch (who) { case (?x) x; case null caller() };
    Iter.toArray(Iter.filter(retirements.vals(), func (r : Retirement) : Bool { Principal.equal(r.owner, p) }))
  };

  // ----------------- Registry & Queries -----------------
  public query func getBatch(id : BatchId) : async ?CreditBatch {
    batches.get(id)
  };

  public query func listBatches() : async [CreditBatch] {
    Iter.toArray(Iter.map(batches.entries(), func ((_, v)) { v }))
  };

  public query func balanceOf(batchId : BatchId, who : Principal) : async Nat {
    getBal(batchId, who)
  };

  public query func scanAllBalances() : async [((BatchId, Principal), Nat)] {
    Iter.toArray(balances.entries())
  };

  public query func auditLog(fromTsNs : ?Nat64) : async [AuditEvent] {
    switch (fromTsNs) {
      case (?t) { Iter.toArray(Iter.filter(audit.vals(), func (e : AuditEvent) : Bool { e.tsNs >= t })) };
      case null { audit }
    }
  };

  // ----------------- Verifier hooks -----------------
  public func verifyBatch(batchId : BatchId, note : Text) : async () {
    assert(isVerifier(caller()), "not verifier");
    ignore batches.get(batchId) else { assert(false, "batch missing") };
    log("verifyBatch", "batch=" # Nat32.toText(batchId) # " note=" # note);
  };

  public func flagBatch(batchId : BatchId, note : Text) : async () {
    assert(isVerifier(caller()), "not verifier");
    ignore batches.get(batchId) else { assert(false, "batch missing") };
    log("flagBatch", "batch=" # Nat32.toText(batchId) # " note=" # note);
  };
}
