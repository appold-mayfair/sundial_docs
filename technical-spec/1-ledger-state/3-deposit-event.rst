.. _h:deposit-event:

Deposit event
=============

A deposit set is a finite map from deposit IDs to deposit info:

.. math::

   \begin{aligned}
       \T{DepositSet} &\coloneq \T{Map(DepositId, DepositInfo)} \\
         &\coloneq \Bigl\{
           (k_i: \T{DepositId}, v_i: \T{DepositInfo}) \mid \forall i \neq j.\; k_i \neq k_j
       \Bigr\}\end{aligned}

A deposit event in a Midgard block acknowledges that a user has created
an L1 utxo at the Midgard L1 deposit address, intending to transfer that
utxo’s tokens to the L2 ledger.

.. math::

   \begin{aligned}
       \T{DepositEvent} &\coloneq (\T{DepositId}, \T{DepositInfo}) \\
       \T{DepositId} &\coloneq \T{OutputRef} \\
       \T{DepositInfo} &\coloneq \left\{
           \begin{array}{ll}
               \T{l2\_address} : & \T{Address} \\
               \T{l2\_datum} : & \T{Option(Data)} \\
           \end{array} \right\}\end{aligned}

The deposit ID corresponds to one of the inputs spent by the user in the
L1 transaction that created the L1 deposit utxo. This identifier is
needed to find the L1 deposit utxo, ensure that deposit events are
unique, and detect when an operator has fabricated a deposit event
without the corresponding deposit utxo existing in the L1 ledger.

Suppose a deposit event is permitted by Midgard’s ledger rules to be
included in a block. In that case, its effect is to add a new L2 utxo to
the block’s utxo set containing the value from the L1 deposit utxo at
the address () and with the inline datum () specified by the user. The
L2 output reference of this new utxo is as follows:

.. math::

   \T{l2\_outref(deposit\_id)} \coloneq \left\{
       \begin{array}{ll}
           \T{id} &\coloneq \T{hash(deposit\_id)} \\
           \T{index} &\coloneq 0
       \end{array} \right\}

In other words, the L2 ledger treats the new utxo as if it was created
by a notional transaction with equal to the hash of the deposit ID.

If the block containing the deposit event is confirmed, the
corresponding L1 deposit utxo may be absorbed into the Midgard reserves
or used to pay for withdrawals. describes the lifecycle of a deposit in
further detail, including how the deposit event information is
validated.
