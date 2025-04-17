Transaction
===========

A transaction set in Midgard is a finite map from **transaction IDs** to **Midgard L2 transactions**, where each ID is the Blake2b-256 hash of its corresponding transaction:

::

    TxSet := Map(TxId, MidgardTx)
           := {
               (kᵢ: TxId, vᵢ: MidgardTx) |
               kᵢ ≡ H_Blake2b-256(vᵢ), ∀ i ≠ j: kᵢ ≠ kⱼ
           }

---

Overview
--------

L2 transactions in Midgard are **endogenous events**:  
- Their effects are validated entirely using the L2 UTXO set.
- Unlike deposits/withdrawals (which reference L1), they are **self-contained**.

A transaction may:
- Spend UTXOs only if it satisfies the spending validator
- Mint/burn tokens only by satisfying relevant minting policies

Users can inject custom logic via redeemers and output datums, which are still governed by script validation.

---

Cardano Transaction Comparison
------------------------------

Midgard’s L2 transaction format was initially modeled after Cardano’s L1 transactions (Conway era).  
However, some Cardano features are **excluded or modified** in Midgard, including:

- No staking/governance actions
- No transaction metadata (but `auxiliary_data_hash` may be set)
- Only inline datums (no datum hashes)
- No bootstrap or pre-Conway features
- POSIX timestamps instead of slot-based timing
- IsValid flag is always `True`
- Midgard-specific network ID

Midgard also integrates support for **CIP-112 (Observe)** and **CIP-128** in advance of Cardano mainnet adoption.

---

Midgard Simplified Transaction Types
------------------------------------

Below is a simplified model of the Midgard transaction structure.

**MidgardSTx**:

::

    {
        body: MidgardSTxBody,
        wits: MidgardSTxWits,
        is_valid: Bool,
        auxiliary_data: ∅
    }

**MidgardSTxBody**:

::

    {
        spend_inputs: Set(OutputRef),
        reference_inputs: Set(OutputRef),
        outputs: [Output],
        fee: Coin,
        validity_interval: MidgardSValidityInterval,
        required_observers: [ScriptCredential],
        required_signer_hashes: [VKeyCredential],
        mint: Value,
        script_integrity_hash: Hash,
        auxiliary_data_hash: Hash,
        network_id: Network,
        ... (∅ for all other fields)
    }

**MidgardSTxWits**:

::

    {
        addr_tx_wits: Set(VKey, Signature, VKeyHash),
        script_tx_wits: Map(ScriptHash, MidgardSScript),
        redeemer_tx_wits: Redeemers,
        ... (∅ for all other fields)
    }

---

Midgard Final Transaction Types
-------------------------------

In finalized Midgard transactions:

- All **variable-length fields** are replaced with hashes `𝓗(...)`
- The **data availability layer** ensures hash-preimage consistency
- DA fraud proofs can be submitted if this mapping is violated

**MidgardTx**:

::

    {
        body: 𝓗(MidgardTxBody),
        wits: 𝓗(MidgardTxWits),
        is_valid: Bool
    }

**MidgardTxBody**:

::

    {
        spend_inputs: 𝓗([OutputRef]),
        reference_inputs: 𝓗([OutputRef]),
        outputs: 𝓗([Output]),
        fee: Coin,
        validity_interval: MidgardSValidityInterval,
        required_observers: 𝓗([ScriptCredential]),
        required_signer_hashes: 𝓗([VKeyCredential]),
        mint: Value,
        script_integrity_hash: Hash,
        auxiliary_data_hash: Hash,
        network_id: Network
    }

**MidgardTxWits**:

::

    {
        addr_tx_wits: 𝓗(Set(VKey, Signature, VKeyHash)),
        script_tx_wits: 𝓗(Map(ScriptHash, MidgardSScript)),
        redeemer_tx_wits: 𝓗(Redeemers)
    }
