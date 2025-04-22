Midgard hub oracle
==================

This oracle keeps track of minting policy IDs and spending validator
addresses for the lists used in the operator directory, state queue, and
fraud proof set of the Midgard protocol. It consists of a single utxo
holding the hub oracle NFT and a datum of the following type:

.. math::

   \texttt{HubOracleDatum} := \left\{
       \begin{array}{ll}
           \texttt{registered_operators} : & \texttt{PolicyId} \\\\
           \texttt{active_operators} : & \texttt{PolicyId} \\\\
           \texttt{retired_operators} : & \texttt{PolicyId} \\\\
           \texttt{scheduler} : & \texttt{PolicyId} \\\\
           \texttt{state_queue} : & \texttt{PolicyId} \\\\
           \texttt{fraud_proof_catalogue} : & \texttt{PolicyId} \\\\
           \texttt{fraud_proof} : & \texttt{PolicyId} \\\\
           \texttt{deposit} : & \texttt{PolicyId} \\\\
           \texttt{withdrawal} : & \texttt{PolicyId} \\\\
           \texttt{settlement_queue} : & \texttt{PolicyId} \\\\
           \texttt{registered_operators_addr} : & \texttt{Address} \\\\
           \texttt{active_operators_addr} : & \texttt{Address} \\\\
           \texttt{retired_operators_addr} : & \texttt{Address} \\\\
           \texttt{scheduler_addr} : & \texttt{Address} \\\\
           \texttt{state_queue_addr} : & \texttt{Address} \\\\
           \texttt{fraud_proof_catalogue_addr} : & \texttt{Address} \\\\
           \texttt{fraud_proof_addr} : & \texttt{Address} \\\\
           \texttt{reserve_addr} : & \texttt{Address}
       \end{array}
   \right\}


Minting policy
--------------

The minting policy ensures that all Midgard lists are initialized
together, sent to their respective spending validator addresses, and
deinitialized together. Redeemers:

Init.
   Initialize all Midgard lists and send their root nodes to their
   respective validator addresses. Conditions:

   #. Let be a static parameter of the minting policy.

   #. must be spent.

   #. The hub oracle NFT must be minted.

   #. Let be the transaction output with the hub oracle NFT.

   #. must *not* contain any other non-ADA tokens.

   #. must be sent to the spending validator address.

   #. The root node NFT of every linked list policy ID in must be minted
      and sent to the corresponding spending validator address in .

   #. The NFT of the policy ID in must be minted and sent to the .

   #. No other tokens must be minted or burned.

   The nonce utxo proves authority for initialization — whoever controls
   it is authorized to initialize the Midgard L1 data structures.

Burn.
   Deinitialize all Midgard lists and burn the hub oracle NFT.
   Conditions:

   #. The transaction must burn the hub oracle NFT.

   #. Let be the transaction input that holds the hub oracle NFT.

   #. The root node NFT of every linked list policy ID in the datum must
      be burned.

   #. The NFT of the policy ID in must be burned.

   Any other burned tokens are irrelevant, and the spending validator
   ensures that no tokens are minted.

Spending validator
------------------

The validator requires every non-ADA token in the transaction to be
burned. Conditions:

#. The transaction must have a single output.

#. The transaction’s output must only contain ADA.
