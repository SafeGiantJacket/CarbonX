# 🌱 Carbon Ledger

**Carbon Ledger** is a decentralized carbon credit management system built on the Internet Computer Protocol (ICP). It enables transparent issuance, trading, and retirement of tokenized carbon credits using Motoko smart contracts.

## 💡 Project Goals

- Empower global climate action with verifiable carbon offset tracking.
- Leverage blockchain for trustless, tamper-proof carbon credit registries.
- Enable marketplaces for carbon credit trading.
- Support secure retirement of credits for accountability and transparency.

---

## 🏗️ Architecture

The system is composed of 4 Motoko canisters:

1. **Registry**: Stores verified carbon offset projects.
2. **Issuance**: Issues carbon credits for valid projects.
3. **Marketplace**: Enables listing, trading, and settlement of carbon credits.
4. **Retirement**: Allows users to retire credits, ensuring they're not reused.

Each canister is isolated but interacts with others via candid interfaces and actor references.

---

## 🧑‍💻 Tech Stack

- 🧠 Motoko
- 🧪 DFINITY SDK (`dfx`)
- 🗃️ Candid Interfaces
- 🔗 Internet Computer Protocol (ICP)
- 🧠 Decentralized WebAssembly smart contracts

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/SafeGiantJacket/carbon-ledger.git
cd carbon-ledger

# Start local replica
dfx start --background

# Deploy all canisters
dfx deploy
