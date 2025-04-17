Withdrawal Event
================

A withdrawal set is a finite map from **withdrawal IDs** to **withdrawal information**:

::

    WithdrawalSet := Map(WithdrawalId, WithdrawalInfo)
                   := {
                        (kᵢ: WithdrawalId, vᵢ: WithdrawalInfo) | ∀ i ≠ j: kᵢ ≠ kⱼ
                   }

---

Withdrawal Event Structure
--------------------------

A **withdrawal event** in a Midgard block acknowledges that a user has created an L1 UTXO at the **Midgard withdrawal address**, requesting to transfer tokens from L2 to L1.

::

    WithdrawalEvent := (WithdrawalId, WithdrawalInfo)

    WithdrawalId := OutputRef

    WithdrawalInfo := {
        l2_outref:   OutputRef,
        l1_address:  Address,
        l1_datum:    Option(Data)
    }

- `WithdrawalId` corresponds to an input in the user's L1 transaction.
- It ensures uniqueness and helps detect fabricated events by verifying that the associated L1 withdrawal UTXO truly exists.

---

Effect of a Valid Withdrawal Event
----------------------------------

If the withdrawal event is allowed by Midgard’s ledger rules:

- The **UTXO at `l2_outref` is removed** from the UTXO set.
- This indicates that the value is no longer available on L2.

---

When the Block is Confirmed
---------------------------

Once the block containing the withdrawal event is **confirmed**:

- Midgard reserves and confirmed deposits are used to **create an L1 UTXO** at:
  - The specified `l1_address`
  - With the inline `l1_datum`
  - Containing the value from the withdrawn L2 UTXO

The **L1 withdrawal request UTXO must be spent** in the same transaction that pays out the withdrawal.

Further lifecycle rules and validation logic are discussed in the `withdrawal-order` section.
