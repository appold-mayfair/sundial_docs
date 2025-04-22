Utxo set
========

A utxo set is a finite map from output reference to transaction output:

.. math::

   \texttt{UtxoSet} := \texttt{Map(OutputRef, Output)} \\
   := \left\{ (k_i: \texttt{OutputRef}, v_i: \texttt{Output}) \;\middle|\; \forall i \ne j.\; k_i \ne k_j \right\}

An output reference is a tuple that uniquely identifies an output by a
hash of the ledger event that created it (either a transaction or a
deposit) and its index among the outputs of that event.

.. math::

   \texttt{OutputRef} := \left\{
       \begin{array}{ll}
           \texttt{id} : & \texttt{TxId} \\
           \texttt{index} : & \texttt{Int}
       \end{array}
   \right\}

An output is a tuple describing a bundle of tokens, data, and a script
that have been placed by a transaction at an address in the ledger:

.. math::

   \texttt{Output} := \left\{
       \begin{array}{ll}
           \texttt{addr} : & \texttt{Address} \\
           \texttt{value} : & \texttt{Value} \\
           \texttt{datum} : & \texttt{Option(Data)} \\
           \texttt{script} : & \texttt{Option(Script)}
       \end{array}
   \right\}

Within the context of a Midgard block, the utxo set that we are
interested in consists of the outputs created by deposits and
transactions but not yet spent by transactions and withdrawals,
considering all the deposits, transactions, and withdrawals of this
block and all its predecessors. This is the utxo set that we transform
into an MPT and place into the block body’s field.
