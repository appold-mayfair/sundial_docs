Confirmed State
===============

When a Midgard block becomes confirmed, selected fields from its block header are grouped into two categories and used to populate Midgard's on-chain confirmed state:

---

ConfirmedState
--------------

::

    ConfirmedState := {
        header_hash:        HeaderHash,
        prev_header_hash:   HeaderHash,
        utxo_root:          MPTR,
        start_time:         PosixTime,
        end_time:           PosixTime,
        protocol_version:   Int
    }

This record captures the **latest confirmed block** on L1.

---

Settlement
----------

::

    Settlement := {
        deposit_root:        MPTR,
        withdraw_root:       MPTR,
        start_time:          PosixTime,
        end_time:            PosixTime,
        resolution_claim:    Option(ResolutionClaim)
    }

A settlement node stores unresolved deposits and withdrawals.  
Unlike `ConfirmedState`, **Settlement records are never overwritten** — a new one is created per block.

---

ResolutionClaim
---------------

::

    ResolutionClaim := {
        time:      PosixTime,
        operator:  VerificationKey
    }

This structure is attached optimistically by an operator to signal that all operations in the settlement node are processed and ready for resolution.

---

Genesis State
-------------

At genesis, the following is used:

::

    genesisConfirmedState := {
        header_hash:        0,
        prev_header_hash:   0,
        utxo_root:          MPTR_empty,
        start_time:         system_start,
        end_time:           system_start,
        protocol_version:   0
    }

---

Storage Behavior
----------------

- **Only the latest** `ConfirmedState` is stored on L1 (older ones are overwritten).
- **All** `Settlement` records are preserved — they live independently in the settlement queue.

---

Settlement Resolution Process
------------------------------

- The current operator may optimistically **attach a `ResolutionClaim`** to a settlement node.
- This claim means all deposits/withdrawals in the node are processed.
- The `resolution_time` is set to:
