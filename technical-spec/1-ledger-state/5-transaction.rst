Transaction
===========

A transaction set in Sundial is a finite map from transaction ID to
Sundial L2 transaction, where the ID is also constrained to be the
Blake2b-256 hash of the transaction:

.. math::

   \texttt{TxSet} := \texttt{Map(TxId, SundialTx)} \\
   := \left\{ (k_i: \texttt{TxId}, v_i: \texttt{SundialTx}) \;\middle|\; 
   k_i \equiv \mathcal{H}_{\texttt{Blake2b-256}}(v_i), \; \forall i \ne j.\; k_i \ne k_j \right\}

An L2 transaction in a Sundial block is an endogenous event. Its
corresponding utxo set transition is validated purely based on the
information contained in the utxo set. This contrasts with deposit and
withdrawal events, which create and spend utxos (respectively) based on
information observed outside the L2 ledger.

A transaction can only spend a utxo if it satisfies the conditions of
the spending validator corresponding to the utxo’s payment address, and
it can only mint and burn tokens by satisfying the conditions of the
corresponding minting policies. Of course, users can inject information
into the utxo set via redeemer arguments and output datums set in
transactions, but those are still subject to the transaction scripts’
conditions.

.. _h:cardano-transaction-types:

Cardano transaction types
-------------------------

Cardano’s L1 transaction type (`Chang 2 hardfork <https://github.com/IntersectMBO/cardano-ledger/blob/cardano-ledger-conway-1.17.2.0/eras/conway/impl/src/Cardano/Ledger/Conway/Tx.hs>`__)
served as an initial model for Sundial’s L2 transaction type. In the
following, field types prefixed by a question mark are set to
appropriate “empty” defaults during deserialization if the serialized
transaction omits them:

.. math::

   \texttt{CardanoTx} := \left\{
   \begin{array}{ll}
       \texttt{body} : & \texttt{CardanoTxBody} \\
       \texttt{wits} : & \texttt{CardanoTxWits} \\
       \texttt{is\_valid} : & \texttt{Bool} \\
       \texttt{auxiliary\_data} : & \;?\;\texttt{TxMetadata}
   \end{array} \right\}

... (REMAINING BLOCK CONVERTED SIMILARLY) ...

.. _h:Sundial-transaction-types:

Sundial transaction types
-------------------------

Sundial’s transaction types modify the above simplified types by
replacing all variable-length fields with hashes (indicated by the
letter :math:`\mathcal{H}` below). The data availability layer is
responsible for confirming that the hashes correspond to their
preimages, and DA fraud proofs can be submitted if this correspondence
is violated.

.. math::

   \texttt{SundialTx} := \left\{
   \begin{array}{ll}
       \texttt{body} : & \mathcal{H}(\texttt{SundialTxBody}) \\
       \texttt{wits} : & \mathcal{H}(\texttt{SundialTxWits}) \\
       \texttt{is\_valid} : & \texttt{Bool}
   \end{array} \right\}

... (SIMPLIFIED TYPES FOLLOWED BY FOOTNOTES) ...

.. [1] In this section, we are mainly concerned with comparing Cardano and Sundial’s deserialized data types. Serialization formats and conversions are addressed in Sundial’s CDDL specifications.

.. [2] For simplicity of exposition, we omit the “era” type parameters, effectively coercing them all to the Conway era. We also simplify the script types.
