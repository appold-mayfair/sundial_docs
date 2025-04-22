Sundial Litepaper
==================

Introduction
------------

In collaboration with the Midgard tech stack, Sundial is the first optimistic rollup network on Cardano. It offloads transaction processing from Layer 1 (L1) to Layer 2 (L2) while maintaining L1’s security and decentralization properties for those transactions. This allows for significantly higher transaction throughput without compromising security.

This whitepaper outlines L1–L2 interactions, Sundial’s target market fit as a hybrid L2 for other UTxO chains (including Bitcoin), and its role in scaling novel use cases as a “super” UTxO chain.

Overview of the Optimistic Rollup Model
---------------------------------------

Sundial implements an optimistic rollup architecture to enhance scalability and security for general-purpose L2 solutions on Cardano.

**Key Economic Incentives:**

- Operators post *bonds* to guarantee block validity; these are slashable if proven invalid.
- The public can submit *fraud proofs* and receive rewards from slashed bonds.
- A family of L1 smart contracts manages state transitions and secures L2 operations.

**Core components include:**

- Operator management system
- Storage for L2-committed transaction blocks
- On-chain fraud proof submission and validation

Technical Overview
------------------

Sundial enhances Cardano’s transaction processing capacity via optimistic rollup technology. It processes transactions off-chain and commits block headers to L1.

**Rollup lifecycle:**

- Operators commit blocks by bonding collateral and publishing block data to a data availability (DA) layer.
- Committed blocks wait in a queue before merging into L1.
- During this period, anyone can verify block validity.
- Fraud proofs can be submitted to slash the operator’s bond.

**Security requirements:**

- The bond must be high enough to deter fraud.
- Rewards must incentivize fraud detection.
- Waiting period must be sufficient to allow fraud discovery.
- The DA layer must be open to all.

Design Goals
------------

Sundial is engineered to:

- Streamline block commitment, fraud detection, and proof validation.
- Allow security parameters to balance:
  - Transaction throughput
  - Confirmation latency
  - Fraud prevention
  - Community participation

Scalability and Efficiency
--------------------------

Sundial reduces costs and increases throughput by validating only disputed transactions on-chain. It uses sparse Merkle trees and compact state formats to optimize storage and performance.

Cardano’s deterministic transaction model allows fraud proofs to focus only on the invalid portion of a transaction. This reduces proof complexity and cost, making it easier for more users to monitor rollup integrity.

**Comparison:** Sundial’s fraud proofs are much smaller than those used in Ethereum’s optimistic rollups, where global state inspection is required.

Censorship Resistance and Fallbacks
-----------------------------------

While optimistic rollups provide validity guarantees, they do not prevent censorship.

Sundial addresses this via:

- **Inclusion times**: Deposits and withdrawals initiated on L1 must be included by operators if their event intervals match.
- **Escalation**: Users can escalate ignored L2 transaction requests by submitting them as L1 orders with guaranteed inclusion.
- **Escape hatch**: If operators halt all block commitments, a special non-optimistic block can be appended by anyone. It includes verified deposits, withdrawals, and L2 transactions, ensuring that user funds are never stranded.

Use Cases
---------

The UTxO model, used by Bitcoin, Dogecoin, and Litecoin, lacks native smart contract functionality. As a result, vast sums in hard assets remain idle.

Sundial addresses this by:

- Merging Bitcoin’s liquidity with Cardano’s eUTxO contracts
- Scaling Cardano with reduced costs and institutional-grade security
- Unlocking DeFi use cases across all UTxO chains

Key Innovations
---------------

- **Babel Fees** – Pay fees with any token
- **ZK Bridge** – Trustless rollup bridge using zero-knowledge proofs
- **Native UTxO Security** – No wallet drainers, no exploits, no failed transactions, no outages
- **Cardano Ecosystem Integration** – Works with top Cardano DeFi and gaming protocols

Core Benefits
-------------

- **Trustless UTxO Interoperability** – Connect BTC, ADA, LTC and others
- **Trading** – High-speed, low-cost asset exchange
- **Lending & Borrowing** – Use UTxO assets as DeFi collateral
- **Staking & Yield** – Secure reward distribution
- **DeFi & Web3** – Integrate BTC into dApps and culture
- **Institutional-Grade Compliance** – Support for advanced compliance and risk tooling

Conclusion
----------

Sundial is the first optimistic rollup on Cardano, built to scale transactions securely. By serving as a hybrid L2 for Bitcoin and other UTxO chains, it enables:

- Seamless asset movement
- Institutional security
- Full integration of Bitcoin into DeFi

With Bitcoin’s projected $10 trillion market cap by 2030, UTxO DeFi solutions are essential. Sundial bridges the gap, unlocking the full potential of UTxO assets in decentralized finance.
