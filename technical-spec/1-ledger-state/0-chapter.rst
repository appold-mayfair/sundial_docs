Ledger State
============

Midgard's L2 ledger consists of a chain of blocks.  
Each block defines a transition from the previous block's set of unspent transaction outputs (UTXOs) to a new UTXO set.

Unlike Cardano's closed-system L1 ledger, Midgard's open-system L2 ledger allows block transitions to **create and destroy UTXOs** in response to exogenous events — namely, deposits and withdrawal requests that occur on the L1 ledger. This is in addition to Midgard's **endogenous L2 transactions**, which work like L1 transactions but with reduced functionality (no staking or governance actions).  
*Note: Midgard's ledger rules permit the "Observe" script purpose defined in [CIP-112](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0112), a principled replacement for “Withdraw 0” expected in the next era of Cardano mainnet (2025).*

---

### Data Availability and Header Commitment

- Blocks are temporarily stored on Midgard's **data availability layer**
- They are permanently archived on **Midgard’s archive nodes**
- Block headers are committed to the **L1 state queue** to establish **immutability**
- Block headers have **fixed byte size** regardless of block content size (deposits, transactions, withdrawals)
- This block-header size leverage is how Midgard **scales Cardano's transaction throughput**

---

### Confirmation Types

Midgard’s contract-based consensus protocol **confirms a block** once all of its predecessors are confirmed **and** one of the following is true:

- **Optimistic confirmation**:  
  The block's maturity period has passed **without any verified fraud proof** on L1 showing rule violation.

- **Non-optimistic confirmation**:  
  A compliance proof is verified on L1, **proving full compliance** with all ledger rules.

---

### Irreversibility and State Compression

Once a block is confirmed:

- The protocol stops tracking:
  - Confirmed **withdrawals** after they are paid out
  - Confirmed **deposits** after they are absorbed into Midgard's reserve
  - Any **transactions** (only the final UTXO set is needed)
- It can drop all **header data** for older confirmed blocks (kept implicitly via chained hash)

---

### Final L1 State Contents

Midgard's confirmed L1 state consists of:

- A **fixed-byte record** from the latest confirmed block header
- A **variable-size dataset** tracking deposits and withdrawal requests until they are fully processed
