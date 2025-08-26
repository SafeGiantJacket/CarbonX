# 🌱 CarbonX – Decentralized Carbon Credit System on ICP

> **Tagline:** *Trustless carbon economy on ICP — verifiable, fractional, and open to everyone.*

---

## 📖 Introduction

Carbon Ledger (aka **CarbonX**) is a decentralized carbon credit management system built on the **Internet Computer Protocol (ICP)**. It covers the full lifecycle — **issuance → trading → retirement** — ensuring each credit is **verifiable, traceable, and tamper‑proof**.

Built with **Motoko** smart contracts and ICP’s native capabilities, CarbonX enables a **trustless, low‑cost, transparent** registry that empowers communities, industries, and governments to participate in a fairer carbon economy.

**Pitch Video**: https://youtu.be/OwJZY3jRlv8
**Demo Video**: https://www.youtube.com/watch?v=YKq00JrW9XM

---

## ✨ What’s New (Aug 2025)

* **IoT Integration**: Stream, validate, and persist environmental telemetry (e.g., CO₂ ppm, soil moisture, biomass proxies) from field sensors to support measurement, reporting, and verification (MRV).
* **AI‑Based Fraud Detection**: Lightweight anomaly detection over claims and telemetry to flag suspicious data patterns prior to issuance and during monitoring.
* **Tinkercad Circuit Demo**: Live prototype of the field sensor stack.

  * 🔗 **Tinkercad Simulation:** [https://www.tinkercad.com/things/bsxHVtX7SHB-carmox](https://www.tinkercad.com/things/bsxHVtX7SHB-carmox)

---

## 🎯 Project Goals

* **Empower Global Climate Action** → Verifiable carbon offset tracking accessible to all.
* **Blockchain‑Backed Trust** → Immutable registries of credits.
* **Decentralized Marketplace** → Efficient trading of tokenized carbon credits.
* **True Accountability** → Retirement guarantees no double counting.
* **Accessibility & Inclusion** → Onboard smallholder farmers, local projects, and individuals.
* **IoT Evidence** → Continuous MRV via sensor streams.
* **AI Guardrails** → Automated checks that surface anomalies and suspected manipulation.

---

## 🏗️ Architecture Overview

CarbonX uses **four Motoko canisters**, each mapping to a lifecycle phase:

1. **Registry Canister** — Stores verified carbon projects and their metadata (methodology, baseline, monitoring plan, MRV sources).
2. **Issuance Canister** — Issues tokenized credits for validated projects; enforces caps, vintages, and verification policies.
3. **Marketplace Canister** — Lists, matches, and settles trades (asks/bids), with fee hooks.
4. **Retirement Canister** — Irreversibly burns credits and emits public attestations.

**Inter‑canister communication** uses **Candid** interfaces and actor references. Modules are composable for future extensions (multi‑chain bridges, AI verification, off‑chain oracles).

---

## 🔌 IoT Integration (NEW)

**Goal:** Provide trustworthy, tamper‑resistant evidence for MRV.

**Data flow**

1. **Field Sensors / Edge** → capture telemetry (e.g., CO₂, temperature, humidity, NDVI proxy)
2. **Gateway / Uploader** → signs payloads (t‑ECDSA optional) and sends to an **IoT Ingest API** (HTTP outcall-capable canister or boundary function)
3. **IoT Adapter Canister** → normalizes, timestamps, and anchors data to the **Registry** (hash‑linked batches to reduce storage costs)
4. **Verification Jobs** → Issuance reads recent telemetry summaries when minting credits

**Minimal payload schema (example)**

```json
{
  "projectId": "prj_abc123",
  "deviceId": "dev_01",
  "ts": 1724553600000,
  "metrics": {
    "co2_ppm": 412.7,
    "soil_moisture": 0.26,
    "temp_c": 28.4
  },
  "sig": "hex_or_base64_signature"
}
```

**Security & integrity**

* Device registration & key rotation per **deviceId**
* Optional **t‑ECDSA** for verifiable signatures
* Batch anchoring (Merkle roots) to minimize on‑chain bytes
* Replay protection via nonces / monotonic timestamps

**Demo**

* 🔗 **Tinkercad circuit:** [https://www.tinkercad.com/things/bsxHVtX7SHB-carmox](https://www.tinkercad.com/things/bsxHVtX7SHB-carmox) (prototype sensor + uploader flow)

---

## 🧠 AI‑Based Fraud Detection (NEW)

**Scope:** Basic, explainable checks that run during **issuance** and **ongoing monitoring**.

**Techniques**

* **Rule‑based sanity checks:** Range bounds, unit consistency, sampling frequency
* **Time‑series anomaly detection:** Z‑score and rolling median absolute deviation
* **Cross‑source corroboration:** Compare sensor data to satellite/IoT peers (where available)

**Workflow**

1. Issuance requests **TelemetrySummary** for a project window
2. AI module computes **riskScore ∈ \[0,1]** and **flags\[]** with explanations
3. If score > threshold → require human/partner verifier approval before mint

**Sample result (concept)**

```json
{
  "projectId": "prj_abc123",
  "window": "2025-08-01..2025-08-25",
  "riskScore": 0.37,
  "flags": [
    {"type": "GAP", "msg": "Missing data for 6h on 2025-08-10"},
    {"type": "SPIKE", "msg": "co2_ppm spike at 3.5σ on 2025-08-18"}
  ]
}
```

---

## 🧑‍💻 Tech Stack

* **Motoko** — Smart contracts
* **DFINITY SDK (dfx)** — Local replica, deploy, test
* **Candid** — Inter‑canister interfaces
* **ICP** — Decentralized hosting & scalability
* **WebAssembly** — Deterministic execution
* **Optional:** HTTP outcalls, **t‑ECDSA**, Bitcoin API for payments

---

## 💡 Uniqueness

* Fully decentralized, community‑accessible registry vs. opaque, centralized markets
* **Fractionalized credits** for low‑barrier participation
* **Native ICP** design for low fees & scalability
* **IoT‑backed MRV** + **AI guardrails** improve trust and auditability

---

## 💰 Revenue Model

* **Transaction Fees** — Minimal fee on marketplace trades
* **Verification Services** — Issuers pay small fees for validation partners / AI checks
* **Carbon‑backed DeFi (Future)** — Use credits as collateral; staking & green finance
* **Adoption** — Start with farmers/NGOs/SMEs → scale to governments & enterprises

---

## 🌐 Full‑Stack Development Scope

* ✅ Smart‑contract backend (4 canisters)
* ✅ Candid APIs for inter‑canister calls
* ✅ IoT ingest + summaries for issuance
* ✅ Basic AI fraud checks in issuance path
* ✅ Marketplace flow (issue → trade → retire)

---

## 📊 Utility & Value

* Closes the **trust gap** in carbon markets
* Open, auditable infrastructure for accountability
* Enables **income for communities** via fractional credits

---

## ⚙️ Code Quality

* Modular Motoko structure (4 canisters + adapters)
* Efficient actor model & Candid interfaces
* Open‑source on GitHub

---

## 📚 Documentation Checklist

* ✅ Introduction & goals
* ✅ Architecture description
* ✅ IoT & AI modules (NEW)
* ✅ Build & deployment (local → mainnet)
* 🔗 **Mainnet Canister IDs:** *to be added post‑deploy*
* ✅ ICP features used
* ⚡ Challenges (inter‑canister orchestration, testing, data integrity)
* 🚀 Future: AI upgrades, DeFi, multi‑chain bridges

---

## 🚀 Getting Started

```bash
# Clone repo
git clone https://github.com/SafeGiantJacket/carbon-ledger.git
cd carbon-ledger

# Start local replica
dfx start --background

# Deploy all canisters
dfx deploy
```

**Repo:** [https://github.com/SafeGiantJacket/carbon-ledger](https://github.com/SafeGiantJacket/carbon-ledger)

---

## 🔒 Interfaces (Sketch)

**Registry.did** (excerpt)

```candid
service : {
  create_project: (ProjectSpec) -> (ProjectId);
  get_project: (ProjectId) -> (opt Project);
  anchor_telemetry_batch: (ProjectId, HashRoot, BatchMeta) -> (BatchId);
}
```

**Issuance.did** (excerpt)

```candid
service : {
  request_mint: (ProjectId, Window) -> (MintTicket);
  finalize_mint: (MintTicket) -> (CreditBatchId);
  get_anomaly_report: (ProjectId, Window) -> (AnomalyReport);
}
```

---

## 🧪 Testing & Validation

* Unit tests for canister logic
* Simulated IoT payloads & edge‑case fixtures
* Replay & signature tests (t‑ECDSA where enabled)
* Issuance gating via anomaly thresholds

---

## ⚡ Challenges

* Cross‑canister orchestration & failure handling
* Cost‑aware data anchoring for high‑volume telemetry
* Calibration & drift in field sensors
* Avoiding false positives in anomaly detection

---

## 🌍 Future Plans

* 🤖 Advanced AI: semi‑supervised & satellite fusion, explainability reports
* 🌉 Cross‑chain credits (Ethereum, etc.)
* 💵 DeFi: carbon‑backed stablecoins & staking
* 🤝 Partnerships with NGOs, SMEs, governments for pilots

---

## 📎 Links

* **GitHub:** [https://github.com/SafeGiantJacket/carbon-ledger](https://github.com/SafeGiantJacket/carbon-ledger)
* **Tinkercad IoT Simulation:** [https://www.tinkercad.com/things/bsxHVtX7SHB-carmox](https://www.tinkercad.com/things/bsxHVtX7SHB-carmox)

---

### © CarbonX 2025 — Open‑source, climate‑positive infrastructure.
