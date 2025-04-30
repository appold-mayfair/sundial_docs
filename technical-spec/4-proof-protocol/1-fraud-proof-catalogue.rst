Fraud proof catalogue
=====================

Sundial uses a key-unordered linked list (see
`[h:key-ordered-list] <#h:key-ordered-list>`__) to track all possible
categories of fraud that can occur in Sundial blocks. Every enforced
Sundial ledger rule (see
`[h:ledger-rules-and-fraud-proofs] <#h:ledger-rules-and-fraud-proofs>`__)
must be represented by a fraud proof category indicating the violation
of that rule.

Each node in the specifies the script hash of the first step in a fraud
proof computation (see
`[h:fraud-proof-computation-threads] <#h:fraud-proof-computation-threads>`__),
which inspects a given block and succeeds if the block has an instance
of the fraud category. The node keys are sequentially ordered and 4
bytes each, allowing the catalogue to track 4096 fraud proof categories.

.. math::

   \texttt{FraudProofCatalogueDatum} := \left\{
       \begin{array}{ll}
           \texttt{init_step} : & \texttt{ScriptHash}
       \end{array}
   \right\}

Minting policy
--------------

The minting policy is statically parametrized on the minting policy and
the Sundial governance key. [1]_ Redeemers:

Init.
   Initialize the via the Sundial hub oracle. Conditions:

   #. The transaction must mint the Sundial hub oracle NFT.

   #. The transaction must Init the list.

Deinit.
   Deinitialize the via the Sundial hub oracle. Conditions:

   #. The transaction must burn the Sundial hub oracle NFT.

   #. The transaction must Deinit the list.

New Fraud Category.
   Catalogue a new Sundial fraud category. Conditions:

   #. The transaction must Append a node to the . Let that node be .

   #. The Sundial governance key must sign the transaction.

   #. Let be the node that links to in the transaction outputs.

   #. The key must be four bytes long.

   #. If is the root node:

      -  The key must be zero.

   #. Otherwise:

      -  The key must be less than 4095.

      -  The must be larger than key by one.

Remove Fraud Category.
   Remove a Sundial fraud category. Conditions:

   #. The transaction must Remove a node from the .

   #. The Sundial governance key must sign the transaction.

Spending validator
------------------

The spending validator of is statically parametrized on the minting
policy. Conditions:

#. The transaction must burn a token.

#. The transaction must *not* mint or burn any other tokens.

.. [1]
   For now, Sundial governance is centralized on a pubkey. This should
   be replaced by the proper governance mechanism when it is specified.
