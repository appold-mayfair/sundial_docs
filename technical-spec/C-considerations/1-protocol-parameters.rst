.. _h:protocol-parameters:

Protocol parameters
===================

Sundial consensus protocol parameters
-------------------------------------

The following parameters must be set before Sundial is initialized.
Their actual values will be determined once Sundial is fully
implemented, tested, and benchmarks. However, for the reader’s
intuition, we provide approximate values that we expect for the
parameters:

.. table:: Sundial consensus protocol parameters.

   ========= ==================================================
   ========================
   Parameter Definition                                         Expected approx. value
   ========= ==================================================
   ========================
   \         `[h:deposit] <#h:deposit>`__                       2–4 minutes
   \         `[h:operator-directory] <#h:operator-directory>`__ 30%–50% of the parameter
   \         `[h:state-queue] <#h:state-queue>`__               3–7 days
   \         `[h:operator-directory] <#h:operator-directory>`__ 1 day
   \         `[h:operator-directory] <#h:operator-directory>`__ 50K–200K ADA
   \         `[h:time-model] <#h:time-model>`__                 1 hour
   \         `[h:operator-directory] <#h:operator-directory>`__ 50%–70% of the parameter
   ========= ==================================================
   ========================

Sundial does not use the Ouroboros consensus protocol, so it does not
need to set the associated protocol parameters.

.. _h:Sundial-ledger-parameters:

Sundial ledger parameters
-------------------------

Sundial’s L2 transactions transition its ledger similarly to Cardano’s
ledger but with the exceptions defined in
`[h:deviations-from-cardano-transaction-types] <#h:deviations-from-cardano-transaction-types>`__.
Consequently, Sundial uses the same ledger-associated protocol
parameters as Cardano but omits certain parameters as follows:

-  No staking or governance parameters.

-  No parameters for obsolete pre-Conway features.

.. _h:Sundial-fee-structure:

Sundial fee structure
---------------------

Sundial will collect fees from all L2 transactions, in a similar way to
how fees are collected for Cardano L1 transactions. Furthermore, Sundial
may collect fees for processing deposits and withdrawals, as these user
events incur costs separate from L2 transactions. However, Sundial’s fee
parameters are expected to be orders of magnitude smaller than Cardano’s
fee parameters.

Sundial’s L1 operating costs per block are fixed, regardless of the
number and complexity of transactions in the block. Sundial’s DA
temporary storage costs per block are proportional to the number and
size of transactions in the block, but these variable costs are orders
of magnitude smaller than Cardano L1 storage costs. Sundial’s revenue
per block is proportional to the number and complexity of transactions
in the block. Therefore, on a per-block basis, Sundial’s fee revenue
grows faster than its costs as the number of transactions in the block
increases. This means that Sundial can sustain much lower L2 transaction
fees once it attains a certain average level of L2 activity.

The specific values of Sundial’s fee parameters will be determined
before launch based on simulations, benchmarks, and community feedback.

.. _h:Sundial-network-parameters:

Sundial network parameters
--------------------------

Technically, Sundial operator nodes do not need to communicate with each
for consensus. Instead, they participate in the consensus protocol by
interacting with Sundial’s smart contracts on L1.

However, in practice, an offchain peer-to-peer gossip network between
operators may help them run things a bit more smoothly for users. If so,
there may be associated protocol parameters to help peers discover the
network topology and communicate with other peers.
