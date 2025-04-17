Sundial Abstract
================

Sundial is the first optimistic rollup protocol on Cardano.  
It offloads transaction processing from Layer 1 (L1) to Layer 2 (L2) while maintaining L1’s security and decentralization properties for those transactions.  
As a result, it can handle a significantly higher volume of transactions without compromising on security.

This whitepaper outlines:
- The interactions between L1 and L2
- The role of operators and watchers
- The processes for managing state transitions and resolving disputes

The optimistic rollup model implemented in Midgard represents a significant advancement in the scalability and security of general-purpose Layer 2 solutions on Cardano.

We discuss the economic incentives that ensure the protocol’s integrity and efficiency:
- **Operators** post **bonds** to guarantee block validity (slashable if proven invalid)
- **Watchers** (public) are incentivized to detect invalid blocks and rewarded if they provide valid fraud proofs

Midgard's architecture leverages a family of smart contracts on Cardano's L1 to:
- Manage state transitions
- Enforce security of L2 operations
- Support operator management
- Store committed transaction blocks from L2
- Submit and validate fraud proofs

---

Midgard’s design aims to provide a **scalable** and **secure** solution for the growing needs of the Cardano ecosystem.

---

Contributors
----------------------------------------------------

- Raul Antonio — Fluid Tokens  
- Matteo Coppola — Fluid Tokens  
- fallen-icarus — P2P-Defi  
- Riley Kilgore — IOG  
- Keyan Maskoot — Anastasia Labs  
- Bora Oben — Anastasia Labs  
- Mark Petruska — Anastasia Labs  
- Kasey White — Cardano Foundation