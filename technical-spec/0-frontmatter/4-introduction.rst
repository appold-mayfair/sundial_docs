Introduction
============

Midgard is a Layer 2 (L2) scaling solution for the Cardano blockchain.  
It employs optimistic rollup technology to enhance Cardano's capacity to process transactions and host more complex applications, delivering a richer user experience at a more competitive cost.  
As Cardano continues to grow in usage and demand, scaling solutions like Midgard are critical for maintaining high performance and low transaction costs.

This whitepaper describes the architecture and technical design of the Midgard protocol, detailing how it integrates with Cardano's Layer 1 (L1) to deliver secure and efficient transaction processing.

---

Optimistic Rollups
------------------

Optimistic rollups process blocks of transactions off-chain and commit those blocks' headers on-chain to the L1 ledger. Each block is committed by a Midgard operator who guarantees the block's validity. The block then waits in a queue for a fixed duration before it is merged into the confirmed state of the optimistic rollup on L1.

Operators must collateralize their guarantee with a bond deposit and publish the full contents of the block to the publicly accessible data availability (DA) layer.

While a block is queued, anyone can inspect its contents and challenge it if it’s invalid. If a fraud proof is submitted, it:
- Prevents the block from being merged
- Slashes the operator's bond
- Rewards the fraud prover with a portion of the slashed bond

Midgard maintains strong finality and security properties *if* the following are true:
- The bond requirement discourages fraud
- Watchers are incentivized to inspect blocks
- The delay period is long enough to detect invalidity
- Data availability is guaranteed for inspection

---

Design Goals
------------

Midgard is designed to streamline how blocks are:
- Committed and merged
- Challenged for fraud
- Verified on-chain

The goal is to optimize the balance between:
- Security
- Transaction throughput
- Confirmation time
- Community involvement

---

Scalability and Efficiency
--------------------------

Midgard significantly increases Cardano’s transaction throughput by processing transactions off-chain and validating them on-chain *only when challenged*. Its rollup architecture uses:
- Sparse Merkle trees
- Compact state representations

These ensure:
- Efficient fraud proof generation
- Minimal on-chain verification costs
- Greater accessibility for public fraud detection

Compared to Ethereum-style rollups, Midgard’s design keeps proofs much smaller and avoids inspecting the global state.

---

Censorship Resistance and Fallback Mechanisms
---------------------------------------------

Midgard ensures block **validity**, but not necessarily **inclusion** of user-initiated transactions.

To prevent censorship:
- Deposits and withdrawals are initiated via L1 contracts
- Each gets a timestamp ("inclusion time")
- Operators must include them in valid blocks
- Failure to do so renders the block invalid

If an operator refuses to include L2 transactions submitted via API, users can escalate by posting an inclusion order on L1 — this guarantees its inclusion in a valid block.

If operators stop committing blocks entirely, **Midgard’s escape hatch** allows:
- A non-operator to post a special block directly to the state queue
- This block includes verified deposits, withdrawals, and L2 transactions

This ensures **users can always exit safely**, even in case of total operator failure.

---

Feedback and Contributions Welcome!
-----------------------------------

This document specifies the:
- Ledger logic
- Smart contracts
- Off-chain components of Midgard

We invite developers, validators, and the broader Cardano community to review, contribute, and collaborate on this evolving specification.