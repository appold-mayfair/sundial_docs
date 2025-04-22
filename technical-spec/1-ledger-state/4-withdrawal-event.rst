.. _h:withdrawal-event:

Withdrawal event
================

A withdrawal set is a finite map from withdrawal ID to withdrawal info:

.. math::

   \begin{aligned}
       \T{WithdrawalSet} &\coloneq \T{Map(WithdrawalId, WithdrawalInfo)} \\
         &\coloneq \Bigl\{
           (k_i: \T{WithdrawalId}, v_i: \T{WithdrawalInfo}) \mid \forall i \neq j.\; k_i \neq k_j
       \Bigr\}\end{aligned}

A withdrawal event in a Midgard block acknowledges that a user has
created an L1 utxo at the Midgard L1 withdrawal address, requesting the
transfer of an L2 utxo’s tokens to the L1 ledger.

.. math::

   \begin{aligned}
       \T{WithdrawalEvent} &\coloneq \T{(WithdrawalId, WithdrawalInfo)} \\
       \T{WithdrawalId} &\coloneq \T{OutputRef} \\
       \T{WithdrawalInfo} &\coloneq \left\{
           \begin{array}{ll}
               \T{l2\_outref} :& \T{OutputRef} \\
               \T{l1\_address} : & \T{Address} \\
               \T{l1\_datum} : & \T{Option(Data)}
           \end{array} \right\}\end{aligned}

The of a withdrawal event corresponds to one of the inputs spent by the
user in the L1 transaction that created the L1 withdrawal request utxo.
This key is needed to identify the L1 withdrawal utxo, ensure that
withdrawal events are unique, and detect when an operator has fabricated
a withdrawal event without the corresponding withdrawal request existing
in the L1 ledger.

If a withdrawal event is permitted by Midgard’s ledger rules to be
included in a block, its effect is to remove the output at
output-reference from the block’s utxo set.

Suppose the block containing the withdrawal event is confirmed. In that
case, tokens from the Midgard reserve and confirmed deposits can be used
to pay for the creation of an L1 utxo at the address () and with the
inline datum () specified by the user, containing the value from the
withdrawn L2 utxo. The L1 withdrawal request utxo must be spent in the
transaction that pays out the withdrawal.

describes the lifecycle of a withdrawal request in further detail,
including how the withdrawal event information is validated.
