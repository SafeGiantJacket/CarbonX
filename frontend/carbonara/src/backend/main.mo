import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

actor Main {
    // Types
    public type Message = {
        id: Nat;
        content: Text;
        author: Text;
        timestamp: Int;
    };

    public type UserProfile = {
        principal: Text;
        name: ?Text;
        created_at: Int;
    };

    // State variables
    private stable var messageCounter: Nat = 0;
    private stable var messagesEntries: [(Nat, Message)] = [];
    private stable var userProfilesEntries: [(Text, UserProfile)] = [];
    
    private var messages = Map.fromIter<Nat, Message>(messagesEntries.vals(), messagesEntries.size(), func(x: Nat, y: Nat) = x == y, func(x: Nat) = x);
    private var userProfiles = Map.fromIter<Text, UserProfile>(userProfilesEntries.vals(), userProfilesEntries.size(), Text.equal, Text.hash);
    private var globalMessage: Text = "Welcome to the ICP Canister!";

    // System functions for upgrades
    system func preupgrade() {
        messagesEntries := Iter.toArray(messages.entries());
        userProfilesEntries := Iter.toArray(userProfiles.entries());
    };

    system func postupgrade() {
        messagesEntries := [];
        userProfilesEntries := [];
    };

    // Public query functions (read-only, fast)
    public query func greet(name: Text): async Text {
        "Hello, " # name # "! Welcome to the Internet Computer!"
    };

    public query func get_message(): async Text {
        globalMessage
    };

    public query func get_all_messages(): async [Message] {
        Iter.toArray(messages.vals())
    };

    public query func get_message_by_id(id: Nat): async ?Message {
        messages.get(id)
    };

    public query func get_user_profile(principal: Text): async ?UserProfile {
        userProfiles.get(principal)
    };

    public query func get_message_count(): async Nat {
        messageCounter
    };

    // Public update functions (can modify state)
    public func set_message(message: Text): async () {
        globalMessage := message;
        Debug.print("Global message updated to: " # message);
    };

    public func create_message(content: Text, author: Text): async Nat {
        let id = messageCounter;
        let message: Message = {
            id = id;
            content = content;
            author = author;
            timestamp = Time.now();
        };
        
        messages.put(id, message);
        messageCounter += 1;
        
        Debug.print("Created message with ID: " # debug_show(id));
        id
    };

    public func update_message(id: Nat, content: Text): async Bool {
        switch (messages.get(id)) {
            case (?existingMessage) {
                let updatedMessage: Message = {
                    id = existingMessage.id;
                    content = content;
                    author = existingMessage.author;
                    timestamp = Time.now(); // Update timestamp
                };
                messages.put(id, updatedMessage);
                true
            };
            case null { false };
        }
    };

    public func delete_message(id: Nat): async Bool {
        switch (messages.remove(id)) {
            case (?_) { true };
            case null { false };
        }
    };

    public func create_user_profile(principal: Text, name: ?Text): async Bool {
        switch (userProfiles.get(principal)) {
            case (?_) { false }; // User already exists
            case null {
                let profile: UserProfile = {
                    principal = principal;
                    name = name;
                    created_at = Time.now();
                };
                userProfiles.put(principal, profile);
                Debug.print("Created user profile for: " # principal);
                true
            };
        }
    };

    public func update_user_profile(principal: Text, name: ?Text): async Bool {
        switch (userProfiles.get(principal)) {
            case (?existingProfile) {
                let updatedProfile: UserProfile = {
                    principal = existingProfile.principal;
                    name = name;
                    created_at = existingProfile.created_at;
                };
                userProfiles.put(principal, updatedProfile);
                true
            };
            case null { false };
        }
    };

    // Utility functions
    public query func get_canister_status(): async {
        message_count: Nat;
        user_count: Nat;
        global_message: Text;
    } {
        {
            message_count = messageCounter;
            user_count = userProfiles.size();
            global_message = globalMessage;
        }
    };

    // Initialize with some default data
    public func init(): async () {
        if (messageCounter == 0) {
            ignore await create_message("Welcome to our ICP canister!", "system");
            ignore await create_message("This is a demo message", "system");
        };
    };
}
