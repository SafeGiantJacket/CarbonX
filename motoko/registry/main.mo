import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";

actor Registry {

  type Project = {
    id: Nat;
    name: Text;
    owner: Principal;
    metadata: Text;
    createdAt: Nat;
  };

  var nextId: Nat = 1;
  let projects = HashMap.HashMap<Nat, Project>(10, Nat.equal, Hash.hash);

  public query func getAllProjects(): async [Project] {
    return Iter.toArray(projects.vals());
  };

  public query func getProject(id: Nat): async ?Project {
    return projects.get(id);
  };

  public shared ({ caller }) func registerProject(name: Text, metadata: Text): async Nat {
    let now = Nat64.toNat(Nat64.fromIntWrap(Time.now()));

    let id = nextId;
    let project: Project = {
      id = id;
      name = name;
      owner = caller;
      metadata = metadata;
      createdAt = now;
    };

    projects.put(id, project);
    nextId += 1;
    return id;
  };

  public shared ({ caller }) func deleteProject(id: Nat): async Bool {
    switch (projects.get(id)) {
      case (null) {
        return false;
      };
      case (?project) {
        if (project.owner == caller) {
          ignore projects.remove(id);
          return true;
        } else {
          return false;
        };
      };
    };
  };

};
