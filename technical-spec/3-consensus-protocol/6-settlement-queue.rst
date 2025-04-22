.. _h:settlement-queue:

Settlement queue
================

The settlement queue tracks confirmed deposits and withdrawal orders
until they are spent. Each settlement node in the queue is created
whenever a block merges into the confirmed state and includes any
deposits or withdrawals. The settlement node contains the block’s
deposits root hash, withdrawals root hash, and event interval. Users
must reference a settlement node to spend its confirmed deposits or
withdrawal orders.

The current operator can optimistically resolve any settlement node,
claiming that its confirmed deposits and withdrawal orders have all been
spent. To do so, the operator attaches a resolution claim to the
settlement queue for the (a protocol parameter). During this maturity
period, if the operator’s resolution claim is proven fraudulent, the
prover can slash the operator’s bond and remove the resolution claim
from the settlement node. After the maturity period, the settlement node
can be removed from the queue if the resolution claim is intact.

The timestamp in the operator’s node in the Operator Directory should be
updated whenever an operator optimistically resolves a settlement node,
similar to how it is updated when committing a block to the state queue.
Updating this timestamp ensures that the operator cannot recover their
bond until all their resolution claims have matured in the settlement
queue.

.. _h:settlement-queue-linked-list:

Linked list representation
--------------------------

The settlement queue’s nodes are arranged as an L1 linked list in the
same chronological order as their corresponding confirmed blocks. This
chronological order makes it possible to prove that an unspent L1 event
is *stranded*—it has not been included in any existing confirmed block
but cannot be included in any new block.

For example, suppose an operator block fraudulently excludes an L1
deposit, but no fraud prover removes the block before its confirmation.
In that case, the deposit cannot be included in any subsequent block or
spent into the reserves. Without the refund mechanism based on proof of
stranding, the deposit would stay stranded forever at Midgard’s deposit
address.

An L1 event is stranded (and can therefore be refunded) if it satisfies
all of the following conditions:

#. The event’s inclusion time is earlier than the confirmed state’s end
   time.

#. Any of the following conditions hold:

   #. The event’s inclusion time is *not* within the event interval of
      any settlement node.

   #. The event’s inclusion time is within the event interval of a
      settlement node. However, the event is *not* in the corresponding
      deposit or withdrawal tree in the settlement node.

In this way, while the Midgard protocol prevents deposits from ever
being stranded in the first place (as long as fraud proofs are promptly
submitted), the refund mechanism ensures that they can still be
retrieved if they occur.

.. _h:settlement-queue-minting-policy:

Minting policy
--------------

The minting policy is statically parametrized on the minting policy.
It’s responsible for appends to the list’s end, and also removal of
nodes anywhere in the list.

Init.
   Initialize the via the Midgard hub oracle. Conditions:

   #. The transaction must mint the Midgard hub oracle NFT.

   #. The transaction must Init the list.

Deinit.
   Deinitialize the via the Midgard hub oracle. Conditions:

   #. The transaction must burn the Midgard hub oracle NFT.

   #. The transaction must Deinit the list.

Append Settlement Node.
   Append a settlement node to store a merged block’s deposits and
   withdrawals. Conditions:

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let be the policy ID in the corresponding field of the Midgard hub
      oracle.

   #. The transaction must Remove a node via the Merge To Confirmed
      State redeemer. Let be the block being merged to the confirmed
      state, and let be its header-hash key.

   #. The transaction must Append a node to the settlement queue with a
      key matching . Let be the node being appended.

   #. and must match on all of these fields:

      -  
      -  
      -  
      -  

   #. The of must be empty.

Resolve Settlement Node.
   Remove a settlement node if its resolution claim has matured.
   Conditions:

   #. The transaction must Remove a node from the . Let be this node.

   #. The of must not be empty.

   #. The transaction must be signed by the of the .

   #. The transaction’s time-validity lower bound must match or exceed
      the of the .

.. _h:settlement-queue-spending-validator:

Spending validator
------------------

The spending validator of is statically parametrized on the and minting
policy. Conditions:

List State Transition.
   Forward to minting policy. Conditions:

   #. The transaction must mint or burn tokens of the minting policy.

Attach Resolution Claim.
   The current operator attaches a resolution claim to a settlement
   node. Conditions:

   #. The spent input must be a settlement node without a resolution
      claim.

   #. The spent input must be reproduced as a settlement node with a
      resolution claim.

   #. The transaction must be signed by the resolution claim’s operator.

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let and be the corresponding policy IDs in the Midgard hub oracle.

   #. The transaction must include an input (), spent via the Update
      Bond Hold New Settlement redeemer, of an node with a key matching
      the resolution claim’s operator.

   #. The of the must match the of the resolution claim.

   #. The transaction must include the utxo as a reference input,
      indicating that the current operator matches the resolution
      claim’s operator.

Disprove Resolution Claim.
   Disprove and detach a settlement node’s resolution claim, slashing
   the claimant operator. Conditions:

   #. The spent input must be a settlement node with a resolution claim.
      Let be the operator of that claim.

   #. The spent input must be reproduced as a settlement node without a
      resolution claim.

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let , , and be the corresponding policy IDs in the Midgard hub
      oracle.

   #. The transaction must include either a deposit or a withdrawal
      order as a reference input. Let that reference input be .

   #. A valid membership proof must be provided, proving that is a
      member of the corresponding tree in the settlement node.

   #. The transaction’s time-validity upper bound must be earlier than
      the resolution claim’s .

   #. Let be a redeemer argument indicating whether is active or
      retired.

   #. If is active:

      #. The transaction must Remove a node from the set via the Remove
         Operator Bad Settlement redeemer. The argument provided to that
         redeemer must match .

   #. Otherwise:

      #. The transaction must Remove a node from the set via the Remove
         Operator Bad Settlement redeemer. The argument provided to that
         redeemer must match .
