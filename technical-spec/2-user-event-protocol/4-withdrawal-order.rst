Withdrawal order (L1)
=====================

A user initiates a withdrawal from Midgard by submitting an L1
transaction that performs the following:

1. Spend an input, which uniquely identifies this withdrawal order.

2. Register a staking script credential to witness the withdrawal order.
   The staking script is parametrized by the withdrawal event, and the credential’s purpose
   is to disprove the existence of the withdrawal order whenever the
   credential is *not* registered.

3. Mint a withdrawal order token to verify the following datum:

   .. math::

      \texttt{WithdrawalOrderDatum} := \left\{
                  \begin{array}{ll}
                      \texttt{event} : & \texttt{WithdrawalEvent}, \\
                      \texttt{inclusion_time} : & \texttt{PosixTime}, \\
                      \texttt{witness} : & \texttt{ScriptHash}, \\
                      \texttt{refund_address} : & \texttt{Address}, \\
                      \texttt{refund_datum} : & \texttt{Option(Data)}
                  \end{array}
                  \right\}

4. Send min-ADA to the Midgard withdrawal order address, along with the
   withdrawal order token and the above datum.

At the time of the L1 withdrawal order, its inclusion time is set to the sum of the L1
transaction’s validity interval upper bound and the Midgard protocol
parameter. According to Midgard’s ledger rules:

Withdrawal order inclusion.
   A block header must include withdrawal orders with inclusion times
   falling within the block header’s event interval, and it must *not*
   include any other withdrawal orders.

The withdrawal order’s outcome is determined as follows:

- If the withdrawal event is included in a settlement queue node, then
  utxos from the Midgard reserve and confirmed deposits can be used to
  pay for the creation of an L1 utxo according to the withdrawal event.

- If the withdrawal order’s inclusion time is within the confirmed
  header’s event interval but not within the event interval of any
  settlement queue node, then the withdrawal order utxo can be refunded
  to its user according to the ``refund_address`` and ``refund_datum`` fields.

The withdrawal order’s staking credential must be deregistered when the
withdrawal order utxo is spent.