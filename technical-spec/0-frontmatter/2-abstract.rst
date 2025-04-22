Midgard L2: Scaling Cardano with Optimistic Rollups
====================================================

.. note::
   **Version:** *DRAFT*  
   *Last updated: |today|*

Authors
-------

- **Philip DiSarro**, Anastasia Labs
- **Jonathan Rodriguez**, Anastasia Labs – `info@anastasialabs.com <mailto:info@anastasialabs.com>`__
- **George Flerovsky**

Abstract
--------

Midgard is the first optimistic rollup protocol on Cardano.  
It offloads transaction processing from Layer 1 (L1) to Layer 2 (L2) while maintaining L1's security and decentralization properties.  
As a result, it can handle a significantly higher volume of transactions without compromising on security.

This whitepaper outlines:

- Interactions between L1 and L2
- The role of operators and watchers
- State transition mechanics
- Dispute resolution mechanisms

Midgard’s architecture represents a major advancement in the scalability and security of general-purpose L2s on Cardano.

**Economic Model:**

- Operators post **bonds** to guarantee block validity
- **Bonds are slashed** when blocks are proven invalid
- **Watchers** are rewarded for submitting fraud proofs that prevent invalid block inclusion

**Key Architecture Features:**

- L1 smart contracts manage transitions and enforce security
- Operator management system
- L2 block storage
- Fraud proof validation

Overall, Midgard aims to be a scalable, secure backbone for the Cardano ecosystem.

Contributors
------------

- **Raul Antonio**, Fluid Tokens
- **Matteo Coppola**, Fluid Tokens
- **fallen-icarus**, P2P-Defi
- **Riley Kilgore**, IOG
- **Keyan Maskoot**, Anastasia Labs
- **Bora Oben**, Anastasia Labs
- **Mark Petruska**, Anastasia Labs
- **Kasey White**, Cardano Foundation

----

.. raw:: html

   <p style="text-align: center; font-size: 0.8em; color: #888;">© Anastasia Labs</p>