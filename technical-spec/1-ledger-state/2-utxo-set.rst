Utxo Set
========

A UTXO set is a finite map from **output references** to **transaction outputs**:

::

    UtxoSet := Map(OutputRef, Output)
             := {
                (kᵢ: OutputRef, vᵢ: Output) | ∀ i ≠ j: kᵢ ≠ kⱼ
             }

---

Output Reference
----------------

An **OutputRef** is a tuple that uniquely identifies an output by:

- A hash of the ledger event that created it (either a transaction or a deposit)
- The index of the output among the outputs of that event

::

    OutputRef := {
        id:     TxId,
        index:  Int
    }

---

Output
------

An **Output** is a tuple describing a bundle of tokens, data, and an optional script at an address:

::

    Output := {
        addr:    Address,
        value:   Value,
        datum:   Option(Data),
        script:  Option(Script)
    }

---

Usage in Midgard
-----------------

Within the context of a Midgard block, the UTXO set includes:

- Outputs created by **deposits** and **transactions**
- Outputs not yet spent by **transactions** or **withdrawals**

It considers **all events from this block and its predecessors**, resulting in a UTXO set that is transformed into a **Merkle Patricia Trie (MPT)** and stored in the block body's `utxo` field.

---

.. note::

   Midgard requires all **L2 datums** to be inline.

.. note::

   Midgard uses a distinct **network ID** for L2 UTXO addresses.
