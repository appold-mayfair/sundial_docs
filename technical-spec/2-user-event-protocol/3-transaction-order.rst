Transaction order (L1)
======================

A user who wants to mitigate the risk of censorship by the current
operator can submit an L2 transaction as an L1 transaction order. A
transaction order is created by an L1 transaction that performs the
following:

1. Spend an input, which uniquely identifies this transaction order.

2. Register a staking script credential to witness the transaction
   order. The staking script is parametrized by the transaction content, and the credential’s
   purpose is to disprove the existence of the transaction order
   whenever the credential is *not* registered.

3. Mint a transaction order token to verify the following datum:

   .. math::

      \texttt{TxOrderDatum} := \left\{
                  \begin{array}{ll}
                      \texttt{tx} : & \texttt{SundialTx}, \\
                      \texttt{inclusion_time} : & \texttt{PosixTime}, \\
                      \texttt{witness} : & \texttt{ScriptHash}, \\
                      \texttt{refund_address} : & \texttt{Address}, \\
                      \texttt{refund_datum} : & \texttt{Option(Data)}
                  \end{array}
                  \right\}

4. Send min-ADA to the Sundial transaction order address, along with the
   transaction order token and the above datum.

At the time of the L1 transaction order, its inclusion time is set to the sum of the L1
transaction’s validity interval upper bound and the Sundial protocol
parameter. According to Sundial’s ledger rules:

Transaction order inclusion.
   A block header must include transaction orders with inclusion times
   falling within the block header’s event interval, and it must *not*
   include any other transaction orders.

Analogously to deposits, transaction orders will eventually be included
in the state queue, as long as operators continue committing valid block
headers. Furthermore, if any blocks are removed from the state queue,
any new committed block must include the transaction orders that should
have been included in the removed blocks.

The transaction order fulfills its purpose when its inclusion time is
within the confirmed header’s event interval. Whether or not the outcome
of the order’s L2 transaction was merged into the confirmed state,
nothing more can be achieved with the transaction order, and it can be
refunded according to the ``refund_address`` and ``refund_datum`` fields.

The transaction order’s staking credential must be deregistered when the
transaction order utxo is spent.