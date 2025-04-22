.. _h:withdrawal-order:

Withdrawal order (L1)
=====================

A user initiates a withdrawal from Midgard by submitting an L1
transaction that performs the following:

#. Spend an input , which uniquely identifies this withdrawal order.

#. Register a staking script credential to witness the withdrawal order.
   The staking script is parametrized by , and the credential’s purpose
   is to disprove the existence of the withdrawal order whenever the
   credential is *not* registered.

#. Mint a withdrawal order token to verify the following datum:

   .. math::

      \T{WithdrawalOrderDatum} \coloneq \left\{
                  \begin{array}{ll}
                      \T{event} : & \T{WithdrawalEvent}, \\
                      \T{inclusion\_time} : & \T{PosixTime}, \\
                      \T{witness} : & \T{ScriptHash}, \\
                      \T{refund\_address}: & \T{Address}, \\
                      \T{refund\_datum}: & \T{Option(Data)}
                  \end{array}
                  \right\}

#. Send min-ADA to the Midgard withdrawal order address, along with the
   withdrawal order token and the above datum.

At the time of the L1 withdrawal order, its is set to the sum of the L1
transaction’s validity interval upper bound and the Midgard protocol
parameter. According to Midgard’s ledger rules:

Withdrawal order inclusion.
   A block header must include withdrawal orders with inclusion times
   falling within the block header’s event interval, and it must *not*
   include any other withdrawal orders.

The withdrawal order’s outcome is determined as follows:

-  If the withdrawal event is included in a settlement queue node, then
   utxos from the Midgard reserve and confirmed deposits can be used to
   pay for the creation of an L1 utxo according to the withdrawal event.

-  If the withdrawal order’s inclusion time is within the confirmed
   header’s event interval but not within the event interval of any
   settlement queue node, then the withdrawal order utxo can be refunded
   to its user according to the and fields.

The withdrawal order’s staking credential must be deregistered when the
withdrawal order utxo is spent.

.. _h:withdrawal-order-staking-script:

Staking script
--------------

.. _h:withdrawal-order-minting-policy:

Minting policy
--------------

.. _h:withdrawal-order-spending-validator:

Spending validator
------------------
