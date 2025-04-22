.. _h:midgard-hub-oracle:

Midgard hub oracle
==================

This oracle keeps track of minting policy IDs and spending validator
addresses for the lists used in the operator directory, state queue, and
fraud proof set of the Midgard protocol. It consists of a single utxo
holding the hub oracle NFT and a datum of the following type:

.. math::

   \T{HubOracleDatum} \coloneq \left\{
       \begin{array}{ll}
           \T{registered\_operators} : & \T{PolicyId} \\
           \T{active\_operators} : & \T{PolicyId} \\
           \T{retired\_operators} : & \T{PolicyId} \\
           \T{scheduler} : & \T{PolicyId} \\
           \T{state\_queue} : & \T{PolicyId} \\
           \T{fraud\_proof\_catalogue} : & \T{PolicyId} \\
           \T{fraud\_proof} : & \T{PolicyId} \\
           \T{deposit} : & \T{PolicyId} \\
           \T{withdrawal} : & \T{PolicyId} \\
           \T{settlement\_queue} : & \T{PolicyId} \\
           \\
           \T{registered\_operators\_addr} : & \T{Address} \\
           \T{active\_operators\_addr} : & \T{Address} \\
           \T{retired\_operators\_addr} : & \T{Address} \\
           \T{scheduler\_addr} : & \T{Address} \\
           \T{state\_queue\_addr} : & \T{Address} \\
           \T{fraud\_proof\_catalogue\_addr} : & \T{Address} \\
           \T{fraud\_proof\_addr} : & \T{Address} \\
           \T{reserve\_addr} : & \T{Address}
       \end{array} \right\}

.. _h:hub-oracle-minting-policy:

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

.. _h:hub-oracle-spending-validator:

Spending validator
------------------

The validator requires every non-ADA token in the transaction to be
burned. Conditions:

#. The transaction must have a single output.

#. The transaction’s output must only contain ADA.
