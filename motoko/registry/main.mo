import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";

actor Registry {

  // ---- TYPES ----
  type Project = {
    id: Nat;
    name: Text;
    owner: Principal;
    metadata: Text;  // IPFS or descriptive JSON
    createdAt: Nat;  // Unix timestamp
  };

  // ---- STORAGE ----
  var nextId: Nat = 1;
  let projects = HashMap.HashMap<Nat, Project>(100, Nat.equal, Hash.hash);

  // ---- REGISTER A NEW PROJECT ----
  public shared ({ caller }) func registerProject(name: Text, metadata: Text): async Nat {
    let now = Nat64.toNat(Nat64.fromIntWrap(Time.now()));

    let id = nextId;
    let project: Project = {
      id;
      name;
      owner = caller;
      metadata;
      createdAt = now;
    };

    projects.put(id, project);
    nextId += 1;
    return id;
  };

  // ---- GET A SPECIFIC PROJECT ----
  public query func getProject(id: Nat): async ?Project {
    projects.get(id);
  };

  // ---- GET ALL PROJECTS ----
  public query func getAllProjects(): async [Project] {
    Iter.toArray(projects.vals());
  };

  // ---- DELETE (ONLY OWNER) ----
  public shared ({ caller }) func deleteProject(id: Nat): async Bool {
    switch (projects.get(id)) {
      case null return false;
      case (?project) {
        if (project.owner == caller) {
          ignore projects.remove(id);
          return true;
        } else {
          return false;
        };
      };
    }
  };
};
