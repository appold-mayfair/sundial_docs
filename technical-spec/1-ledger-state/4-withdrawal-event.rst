Withdrawal event
================

A withdrawal set is a finite map from withdrawal ID to withdrawal info:

.. math::

   \texttt{WithdrawalSet} := \texttt{Map(WithdrawalId, WithdrawalInfo)} \\
   := \left\{ (k_i: \texttt{WithdrawalId}, v_i: \texttt{WithdrawalInfo}) \;\middle|\; \forall i \ne j.\; k_i \ne k_j \right\}

A withdrawal event in a Sundial block acknowledges that a user has
created an L1 utxo at the Sundial L1 withdrawal address, requesting the
transfer of an L2 utxo’s tokens to the L1 ledger.

.. math::

   \begin{aligned}
   \texttt{WithdrawalEvent} &:= (\texttt{WithdrawalId}, \texttt{WithdrawalInfo}) \\\\
   \texttt{WithdrawalId} &:= \texttt{OutputRef} \\\\
   \texttt{WithdrawalInfo} &:= \left\{
       \begin{array}{ll}
           \texttt{l2_outref} : & \texttt{OutputRef} \\\\
           \texttt{l1_address} : & \texttt{Address} \\\\
           \texttt{l1_datum} : & \texttt{Option(Data)}
       \end{array}
   \right\}
   \end{aligned}

The ID of a withdrawal event corresponds to one of the inputs spent by the
user in the L1 transaction that created the L1 withdrawal request utxo.
This key is needed to identify the L1 withdrawal utxo, ensure that
withdrawal events are unique, and detect when an operator has fabricated
a withdrawal event without the corresponding withdrawal request existing
in the L1 ledger.

If a withdrawal event is permitted by Sundial’s ledger rules to be
included in a block, its effect is to remove the output at
``l2_outref`` from the block’s utxo set.

Suppose the block containing the withdrawal event is confirmed. In that
case, tokens from the Sundial reserve and confirmed deposits can be used
to pay for the creation of an L1 utxo at the address (``l1_address``) and with the
inline datum (``l1_datum``) specified by the user, containing the value from the
withdrawn L2 utxo. The L1 withdrawal request utxo must be spent in the
transaction that pays out the withdrawal.

The lifecycle of a withdrawal request is described in more detail elsewhere,
including how the withdrawal event information is validated.
