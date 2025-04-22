Deposit (L1)
============

A user deposits funds into Midgard by submitting an L1 transaction that
performs the following:

1. Spend an input, which uniquely identifies this deposit transaction.

2. Register a staking script credential to witness the deposit. The
   script is parametrized by the deposit event, and the credential’s purpose is to
disprove the existence of the deposit whenever the credential is
*not* registered. [1]_

3. Mint a deposit auth token to verify the following datum:

   .. math::

      \texttt{DepositDatum} := \left\{
                  \begin{array}{ll}
                      \texttt{event} : & \texttt{DepositEvent}, \\
                      \texttt{inclusion_time} : & \texttt{PosixTime}, \\
                      \texttt{witness} : & \texttt{ScriptHash}, \\
                      \texttt{refund_address} : & \texttt{Address}, \\
                      \texttt{refund_datum} : & \texttt{Option(Data)}
                  \end{array}
                  \right\}

4. Send the user’s deposited funds to the Midgard deposit address, along
   with the deposit auth token and the above datum.

At the time of the L1 deposit transaction, the deposit’s inclusion time is set to the
sum of the transaction’s validity interval upper bound and the Midgard
protocol parameter. According to Midgard’s ledger rules:

Deposit inclusion.
   A block header must include deposit events with inclusion times
   falling within the block header’s event interval, and it must *not*
   include any other deposit events.

Furthermore, the state queue enforces that event intervals are adjacent
and non-overlapping. Therefore, while operators continue committing
valid block headers, every deposit is eventually included in the state
queue.

On the other hand, suppose a fraud proof is verified on L1 to prove that
a block header in the state queue has violated the deposit inclusion
rule. When this block header and all its descendants are removed, the
state queue enforces that the next committed block header’s event
interval must contain all of those removed block headers’ event
intervals. Therefore, Midgard’s ledger rules require this new block
header to include all deposit events that should have been included in
the removed block headers.

The deposit’s outcome is determined as follows:

- If the deposit event is included in a settlement queue node, then the
  deposit utxo can be absorbed into the Midgard reserves or used to pay
  for withdrawals.

- If the deposit’s inclusion time is within the confirmed header’s
  event interval but not within the event interval of any settlement
  queue node, then the deposit utxo can be refunded to its user
  according to the ``refund_address`` and ``refund_datum`` fields.

The deposit’s staking credential must be deregistered when the deposit
utxo is spent.

.. _h:deposit-staking-script:

Staking script
--------------

.. _h:deposit-minting-policy:

Minting policy
--------------

.. _h:deposit-spending-validator:

Spending validator
------------------

.. [1]
   Cardano’s ledger lacks a more direct method to disprove the existence
   of a utxo to a Plutus script.
