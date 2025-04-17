Deposit Event
=============

A deposit set is a finite map from **deposit IDs** to **deposit info**:

::

    DepositSet := Map(DepositId, DepositInfo)
                := {
                    (kᵢ: DepositId, vᵢ: DepositInfo) | ∀ i ≠ j: kᵢ ≠ kⱼ
                }

---

Deposit Event Structure
------------------------

A deposit event in a Midgard block acknowledges that a user has created an L1 UTXO at the Midgard deposit address with the intent to transfer that value to the L2 ledger.

::

    DepositEvent := (DepositId, DepositInfo)

    DepositId := OutputRef

    DepositInfo := {
        l2_address: Address,
        l2_datum: Option(Data)
    }

The **DepositId** is one of the inputs spent by the user in the L1 transaction that created the deposit UTXO.

This identifier is important for:
- Finding the original L1 deposit UTXO
- Ensuring deposit events are **unique**
- Preventing fabricated deposit events that don't match real L1 transactions

---

L2 Output Generation
---------------------

If the deposit event is allowed under Midgard's ledger rules, its effect is to **add a new L2 UTXO** to the block’s UTXO set with:

- **Value** from the original L1 deposit
- **Address** as `l2_address`
- **Datum** as `l2_datum` (inline)

The L2 output reference is constructed as:

::

    l2_outref(deposit_id) := {
        id:    hash(deposit_id),
        index: 0
    }

In other words, L2 treats the new UTXO as if it were created by a **notional transaction** whose TxId is the hash of the deposit ID.

---

Lifecycle of a Deposit
-----------------------

If a block containing a deposit event is **confirmed**, the related L1 UTXO may:

- Be **absorbed into Midgard reserves**, or
- Be **used to fund L2 withdrawals**

Further validation rules for deposit event lifecycles are described in the `Deposit` section.
