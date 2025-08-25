# ICP Canister DApp Deployment Guide

This guide will help you deploy your ICP canister DApp to the Internet Computer.

## Prerequisites

1. **Install DFX SDK**
   \`\`\`bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   \`\`\`

2. **Verify Installation**
   \`\`\`bash
   dfx --version
   \`\`\`

## Local Development

### 1. Start Local Replica
\`\`\`bash
dfx start --clean --background
\`\`\`

### 2. Deploy Backend Canister
\`\`\`bash
dfx deploy backend
\`\`\`

### 3. Get Canister ID
\`\`\`bash
dfx canister id backend
\`\`\`

### 4. Update Frontend Configuration
Update the `CANISTER_ID` in `lib/icp-agent.ts` with your deployed canister ID:
\`\`\`typescript
const CANISTER_ID = "your-actual-canister-id-here"
\`\`\`

### 5. Test Locally
\`\`\`bash
npm run dev
\`\`\`

## Production Deployment

### 1. Deploy to IC Mainnet
\`\`\`bash
dfx deploy --network ic
\`\`\`

### 2. Update Canister ID
Update `lib/icp-agent.ts` with the mainnet canister ID.

### 3. Build and Deploy Frontend
\`\`\`bash
npm run build
dfx deploy frontend --network ic
\`\`\`

## Environment Variables

For local development, you may need to set:
\`\`\`bash
export INTERNET_IDENTITY_CANISTER_ID="rdmx6-jaaaa-aaaah-qcaiq-cai"
\`\`\`

## Troubleshooting

### Common Issues

1. **Canister Not Found**
   - Ensure the canister is deployed: `dfx canister status backend`
   - Check the canister ID is correct in `lib/icp-agent.ts`

2. **Authentication Issues**
   - Clear browser cache and cookies
   - Ensure Internet Identity is accessible
   - Check network configuration (local vs mainnet)

3. **CORS Issues**
   - Ensure `fetchRootKey()` is called for local development
   - Check agent configuration in `lib/icp-agent.ts`

### Useful Commands

\`\`\`bash
# Check canister status
dfx canister status backend

# View canister logs
dfx canister logs backend

# Stop local replica
dfx stop

# Generate canister interfaces
dfx generate backend
\`\`\`

## Next Steps

1. Customize the canister logic in `src/backend/main.mo`
2. Add more frontend features and components
3. Implement additional authentication methods
4. Add error handling and user feedback
5. Optimize for production deployment
