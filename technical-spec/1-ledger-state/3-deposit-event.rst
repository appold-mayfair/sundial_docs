Deposit event
=============

A deposit set is a finite map from deposit IDs to deposit info:

.. math::

   \texttt{DepositSet} := \texttt{Map(DepositId, DepositInfo)} \\
   := \left\{ (k_i: \texttt{DepositId}, v_i: \texttt{DepositInfo}) \;\middle|\; \forall i \ne j.\; k_i \ne k_j \right\}

A deposit event in a Midgard block acknowledges that a user has created
an L1 utxo at the Midgard L1 deposit address, intending to transfer that
utxo’s tokens to the L2 ledger.

.. math::

   \begin{aligned}
   \texttt{DepositEvent} &:= (\texttt{DepositId}, \texttt{DepositInfo}) \\\\
   \texttt{DepositId} &:= \texttt{OutputRef} \\\\
   \texttt{DepositInfo} &:= \left\{
       \begin{array}{ll}
           \texttt{l2_address} : & \texttt{Address} \\\\
           \texttt{l2_datum} : & \texttt{Option(Data)}
       \end{array}
   \right\}
   \end{aligned}

The deposit ID corresponds to one of the inputs spent by the user in the
L1 transaction that created the L1 deposit utxo. This identifier is
needed to find the L1 deposit utxo, ensure that deposit events are
unique, and detect when an operator has fabricated a deposit event
without the corresponding deposit utxo existing in the L1 ledger.

Suppose a deposit event is permitted by Midgard’s ledger rules to be
included in a block. In that case, its effect is to add a new L2 utxo to
the block’s utxo set containing the value from the L1 deposit utxo at
the address (``l2_address``) and with the inline datum (``l2_datum``) specified by the user. The
L2 output reference of this new utxo is as follows:

.. math::

   \texttt{l2_outref(deposit_id)} := \left\{
       \begin{array}{ll}
           \texttt{id} : & \texttt{hash(deposit_id)} \\\\
           \texttt{index} : & 0
       \end{array}
   \right\}

In other words, the L2 ledger treats the new utxo as if it was created
by a notional transaction with ``id`` equal to the hash of the deposit ID.

If the block containing the deposit event is confirmed, the
corresponding L1 deposit utxo may be absorbed into the Midgard reserves
or used to pay for withdrawals. The deposit lifecycle is described in more detail elsewhere, including how the deposit event information is validated.