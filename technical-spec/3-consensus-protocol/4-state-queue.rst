State queue
===========

The state queue is an L1 data structure that stores Midgard operators’
committed block headers until they are confirmed. Active operators from
the operator directory (see
`[h:operator-directory] <#h:operator-directory>`__) take turns
committing block headers to the state queue according to the rotating
schedule enforced by the scheduler (see
`[h:scheduler] <#h:scheduler>`__).

Utxo representation
-------------------

The is implemented as a key-unordered linked list of block headers (see
`[h:block] <#h:block>`__). Each node’s key is its block header’s hash.

.. math::

   \begin{aligned}
   \texttt{StateQueueDatum} &:= \texttt{NodeDatum}(\texttt{Header}) \\\\
   \texttt{valid_key}(\texttt{scd} : \texttt{StateQueueDatum}) &:= 
       \Bigl( \texttt{scd.key} \equiv \texttt{Some}(\texttt{hash}(\texttt{scd.data})) \Bigr)
   \end{aligned}

Committing a block header to the state queue means appending a node containing the
block header to the end of the queue. After remaining in the queue for the duration
of the confirmation delay (a Midgard protocol parameter), it is merged into the confirmed state
(held at the root node) in first-in-first-out (FIFO) order.

Minting policy
--------------

The minting policy controls the structural changes to the state queue.
It is statically parametrized on the , , , , and minting policies.
Redeemers:

Init.
   Initialize the via the Midgard hub oracle. Conditions:

   #. The transaction must mint the Midgard hub oracle token.

   #. The transaction must Init the .

Deinit.
   Deinitialize the via the Midgard hub oracle. Conditions:

   #. The transaction must burn the Midgard hub oracle token.

   #. The transaction must Deinit the .

Commit Block Header.
   An operator commits a block header to the state queue if it is the
   operator’s turn according to the rotating schedule. Grouped
   conditions:

   -  Commit the block header to the state queue, with the operator’s
      consent:

      #. Let be a redeemer argument indicating the key of the operator
         committing the block header.

      #. The transaction must be signed by .

      #. The transaction must Append a node to the . Among the
         transaction outputs, let that node be and its predecessor node
         be .

      #. must be the operator of .

      #. The field of must be the hash of its field.

   -  Verify that it is the operator’s turn to commit according to the
      scheduler:

      #. The transaction must include a reference input with the
         scheduler NFT. Let that input be the .

      #. The field of must match .

   -  Verify block timestamps:

      #. The of must be equal to the of the .

      #. The of must match the transaction’s time-validity upper bound.

      #. The of must be within the shift interval of .

   -  Update the operator’s timestamp in the active operators set:

      #. The transaction must include an input, spent via the Update
         Bond Hold New State redeemer, of an node with a key matching
         the .

Merge To Confirmed State.
   If a block header is mature, merge it to the confirmed state of the .
   Conditions:

   #. The transaction must Remove a node from the . Let be the removed
      node, be its predecessor node before removal, and be the remaining
      node after removal.

   #. and must both be root nodes of .

   #. must be mature — the lower bound of the transaction validity
      interval meets or exceeds the sum of the field of and the Midgard
      protocol parameter.

   #. must match:

      #. on .

      #. on , , , and .

   #. The of must match the key.

   #. If either the or of is *not* the MPT root hash of the empty set, a
      node must be appended via the New Settlement redeemer. The
      redeemer must mention by input index.

Remove Fraudulent Block Header.
   Remove a fraudulent block header from the state queue and slash its
   operator’s ADA bond. Grouped conditions:

   -  Remove the fraudulent block header:

      #. Let be a redeemer argument indicating the operator who
         committed the fraudulent block header.

      #. The transaction must Remove a node from the . Let be the
         removed node and be its predecessor node before removal.

      #. must match the key of .

   -  Slash the fraudulent operator:

      #. Let be a redeemer argument indicating whether the fraudulent
         operator is active or retired.

      #. If is active:

         #. The transaction must Remove a node from the set via the
            Remove Operator Bad State redeemer. The argument provided to
            that redeemer must match .

      #. Otherwise:

         #. The transaction must Remove a node from the set via the
            Remove Operator Bad State redeemer. The argument provided to
            that redeemer must match .

   -  Verify that fraud has been proved for the removed node or its
      predecessor:

      #. The transaction must include a reference input holding a token.

      #. Let be the last 28 bytes of the token.

      #. One of the following must be true:

         #. matches the key. This means that a child of the fraudulent
            node is being removed.

         #. matches the key, and the last node of is . This means that
            the fraudulent node is being removed and has no more
            children.

.. _h:state-queue-spending-validator:

Spending validator
------------------

The spending validator of always forwards to its corresponding minting
policy (statically parametrized) and requires the transaction to invoke
it. It does not allow any in-place modifications to the field of nodes
in . Conditions:

#. The transaction must mint or burn tokens of the minting policy.
