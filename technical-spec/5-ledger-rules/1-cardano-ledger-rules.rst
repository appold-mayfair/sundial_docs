Midgard Ledger Rules and Fraud Proofs
===============================

In the following sections the following premises are used:

.. math::

   \begin{split}
      b & \in Blocks \\
      txs & := transactions(b) \\
      utxos_{pre} & := prev\_utxos(b) \\
      utxos_{post} & := utxos(b) \\
      wtxs & := withdrawals(b)
   \end{split}


Rule: All inputs must be valid
------------------------------

.. _rule:all-inputs-must-be-valid:

A transaction cannot spend a non-existing (or an already spent) UTxO.

**Formal specification:**

.. math::

   \begin{split}
     &\forall t \in Ledger,\; \forall i \in spend\_inputs(t): \\
       &\quad(
         \exists t_1 \in Ledger,\;
           t \neq t_1 \;\land\;
           i \in outputs(t_1) 
       ) \;\land\\
       &\quad(
         \nexists t_2 \in Ledger,\;
           t \neq t_2 \;\land\;
           i \in spend\_inputs(t_2)
       )
   \end{split}

**This ledger rule is violated if any of the following occur:**

- :ref:`violation:NO-INPUT`
- :ref:`violation:INPUT-NO-IDX`
- :ref:`violation:WITHDRAWN-INPUT`
- :ref:`violation:DOUBLE-SPEND`
- :ref:`violation:DOUBLE-WITHDRAW`


NO-INPUT violation
~~~~~~~~~~~~~~~~~~

.. _violation:NO-INPUT:

A transaction *t* attempted to spend UTxO *i* that does not exist or was spent in a previous block.

**Formal specification:**

.. math::

   \begin{split}
     &\exists t \in txs,\; \exists i \in spend\_inputs(t): \\
       &\quad(
         i \notin utxos_{prev}
       ) \;\land\\
       &\quad(
         \nexists t_1 \in txs,\;
         t \neq t_1 \;\land\; tx\_hash(t_1) = tx\_hash(i)
       )
   \end{split}

**Fraud proof construction:**

1. Let *t* be the transaction alleged to violate the ledger rule.
2. Prove *t ∈ txs*.
3. Prove *i ∈ spend_inputs(t)*.
4. Show *i ∉ utxos_prev*.
5. Prove no other transaction in *txs* has the same tx hash as *i*.
