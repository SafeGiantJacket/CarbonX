# ICP Canister DApp

A full-stack decentralized application built on the Internet Computer Protocol (ICP) with a Motoko backend canister and Next.js frontend.

## Features

- **Backend Canister (Motoko)**:
  - Message management (create, read, update, delete)
  - User profile management
  - Global message storage
  - Query and update functions
  - Persistent state with upgrade compatibility

- **Frontend (Next.js)**:
  - Modern React interface with Tailwind CSS
  - Internet Identity authentication
  - Real-time canister interaction
  - Responsive design with dark mode support

## Development Setup

### Prerequisites

- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer development kit)
- Node.js 18+ and npm
- Internet Identity for authentication

### Local Development

1. **Start the local Internet Computer replica:**
   \`\`\`bash
   dfx start --clean --background
   \`\`\`

2. **Deploy the backend canister:**
   \`\`\`bash
   dfx deploy backend
   \`\`\`

3. **Install frontend dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

4. **Start the frontend development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Build and deploy frontend assets:**
   \`\`\`bash
   npm run build
   dfx deploy frontend
   \`\`\`

### Deployment Commands

\`\`\`bash
# Deploy to local network
dfx deploy --network local

# Deploy to IC mainnet
dfx deploy --network ic

# Generate canister interfaces
dfx generate backend
\`\`\`

## Project Structure

\`\`\`
├── src/backend/          # Motoko canister source
│   └── main.mo          # Main canister logic
├── app/                 # Next.js frontend
├── lib/                 # Utility functions
│   ├── icp-agent.ts     # ICP agent configuration
│   └── canister-types.ts # Type definitions
├── dfx.json            # DFX configuration
└── README.md           # This file
\`\`\`

## Canister API

### Query Functions (Read-only)
- `greet(name: Text)` - Returns a greeting message
- `get_message()` - Gets the global message
- `get_all_messages()` - Returns all stored messages
- `get_message_by_id(id: Nat)` - Gets a specific message
- `get_user_profile(principal: Text)` - Gets user profile
- `get_canister_status()` - Returns canister statistics

### Update Functions (State-changing)
- `set_message(message: Text)` - Updates global message
- `create_message(content: Text, author: Text)` - Creates new message
- `update_message(id: Nat, content: Text)` - Updates existing message
- `delete_message(id: Nat)` - Deletes a message
- `create_user_profile(principal: Text, name: ?Text)` - Creates user profile
- `update_user_profile(principal: Text, name: ?Text)` - Updates user profile

## Next Steps

1. Deploy the canister to local network
2. Test canister functions via Candid UI
3. Connect frontend to deployed canister
4. Implement Internet Identity authentication
5. Deploy to IC mainnet
