.. _h:utxo-set:

Utxo set
========

A utxo set is a finite map from output reference to transaction output:

.. math::

   \begin{aligned}
       \T{UtxoSet} &\coloneq \T{Map(OutputRef, Output)} \\
         &\coloneq \Bigl\{
           (k_i: \T{OutputRef}, v_i: \T{Output}) \mid \forall i \neq j.\; k_i \neq k_j
       \Bigr\}\end{aligned}

An output reference is a tuple that uniquely identifies an output by a
hash of the ledger event that created it (either a transaction or a
deposit) and its index among the outputs of that event.

.. math::

   \T{OutputRef} \coloneq \left\{
       \begin{array}{ll}
           \T{id} : & \T{TxId} \\
           \T{index} : & \T{Int}
       \end{array} \right\}

An output is a tuple describing a bundle of tokens, data, and a script
that have been placed by a transaction at an address in the ledger:

.. math::

   \T{Output} \coloneq \left\{
       \begin{array}{ll}
           \T{addr} : & \T{Address} \\
           \T{value} : & \T{Value} \\
           \T{datum} : & \T{Option(Data)} \\
           \T{script} : & \T{Option(Script)}
       \end{array} \right\}

Within the context of a Midgard block, the utxo set that we are
interested in consists of the outputs created by deposits and
transactions but not yet spent by transactions and withdrawals,
considering all the deposits, transactions, and withdrawals of this
block and all its predecessors. This is the utxo set that we transform
into an MPT and place into the block body’s field.
