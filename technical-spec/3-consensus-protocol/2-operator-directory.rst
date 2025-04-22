.. _h:operator-directory:

Operator directory
==================

Midgard operators receive and process L2 events from users, collate them
into blocks, publish the full block contents on the data availability
layer, and commit the block headers to Midgard’s state queue on L1. This
responsibility is shared among the operators on a rotating schedule,
with each operator getting a turn to exclusively process L2 events and
then commit their block of events at the end of their turn.

Anyone can register to become a Midgard operator if they post the
required ADA bond. Registrants must wait a prescribed period of time
before they activate as an operator. An active operator can retire to
remove themself from the rotating schedule. Retired operators must wait
until all their committed block headers mature before recovering their
ADA bond.

An operator’s ADA bond collateralizes their promise to faithfully
process L2 events and commit valid blocks to L1. If an operator’s block
header is proven to be fraudulent, then the operator is disqualified and
forfeits their bond. Similarly, an operator that submits duplicate
registrations forfeits the bonds placed in the duplicates.

Every forfeited bond is split into a reward paid to the fraud prover and
a slashing penalty paid (via transaction fees) to the Cardano treasury.
Among the Midgard protocol parameters, the and parameters must sum up to
the parameter.

.. _h:operator-directory-utxo-representation:

Utxo representation
-------------------

The Operator Directory keeps track of all Midgard operators and stores
their bond deposits. It separates operators into three groups based on
their status, with every group using operators’ public key hashes (PKHs)
as keys:

-  is a first-in-first-out (FIFO) queue that tracks operators who have
   posted their ADA bonds and are waiting to activate. It is implemented
   as a key-unordered linked list (see
   `[h:key-unordered-list] <#h:key-unordered-list>`__), where each new
   registrant is prepended to the beginning of the list. This means that
   the earliest registrant to become eligible for activation is always
   at the last node of the list.

-  is a set that tracks active operators participating in the rotating
   schedule, implemented as a key-ordered linked list (see
   `[h:key-ordered-list] <#h:key-ordered-list>`__).

-  is a set that tracks retired operators waiting to recover their ADA
   bonds, implemented as a key-ordered linked list.

The Operator Directory keeps track of the activation time of every
registered operator, which indicates when the operator will become
eligible for activation. It also keeps track of any holds on the ADA
bonds of active and retired operators, which prevent those operators
from recovering their bonds until their latest committed blocks and
latest settlement resolution claims mature.

.. math::

   \begin{aligned}
       \T{RegisteredOperator} &\coloneq \Bigl( \T{activation\_time}: \T{PosixTime} \Bigr) \\
       \T{ActiveOperator}     &\coloneq \Bigl( \T{bond\_unlock\_time}:
           \T{Option}(\T{PosixTime}) \Bigr) \\
       \T{RetiredOperator}    &\coloneq \Bigl( \T{bond\_unlock\_time}:
           \T{Option}(\T{PosixTime}) \Bigr)\end{aligned}

The above are app-specific types for the field of their respective
lists’ . For example, the of is:

.. math:: \T{RegisteredOperatorDatum} \coloneq \T{NodeDatum} (\T{RegisteredOperator})

.. _h:registered-operators:

Registered operators
--------------------

The queue keeps track of operators after registering and before
activating or de-registering them.

.. _h:registered-operators-minting-policy:

Minting policy
~~~~~~~~~~~~~~

The minting policy implements state transitions for its key-unordered
linked list. It is statically parametrized on the and minting policies.
Redeemers:

Init.
   Initialize the queue via the Midgard hub oracle. Conditions:

   #. The transaction must mint the Midgard hub oracle NFT.

   #. The transaction must Init the queue.

Deinit.
   Deinitialize the queue via the Midgard hub oracle. Conditions:

   #. The transaction must burn the Midgard hub oracle NFT.

   #. The transaction must Deinit the queue.

Register Operator.
   Prepend a node into the queue with the operator’s ADA bond at the
   operator’s key, noting the registration time. Grouped conditions:

   -  Verify the registration and prepend the registrant to the
      registered operators:

      #. The transaction must Prepend a node into the queue. Let that
         node be .

      #. The field of must correspond to a public key hash that signed
         the transaction.

      #. The field of must equal the sum of the Midgard protocol
         parameter and the upper bound of the transaction’s validity
         interval.

      #. The Lovelace in the must equal the Midgard parameter.

   -  Verify that the registrant is not already active or retired.

      #. The transaction must include the Midgard hub oracle NFT in a
         reference input.

      #. Let be the policy ID in the corresponding field of the Midgard
         hub oracle.

      #. The transaction must include a reference input of a node that
         proves the key’s non-membership in that list.

      #. The transaction must include a reference input of a node that
         proves the key’s non-membership in that list.

Activate Operator.
   Transfer an operator node from the queue to the set. Grouped
   conditions:

   -  Remove the registrant from the registered operators if it is
      eligible to activate:

      #. The transaction must Remove a node from the queue. Let that
         node be .

      #. The lower bound of the transaction validity interval must meet
         or exceed the .

   -  Verify that the registrant is being added to active operators:

      #. The transaction must include the Midgard hub oracle NFT in a
         reference input.

      #. Let be the policy ID in the corresponding field of the Midgard
         hub oracle.

      #. The transaction must Insert a node into the set, as evidenced
         by minting a node NFT for the key.

   -  Verify that the registrant is not already retired:

      #. The transaction must include a reference input of a node that
         proves the key’s non-membership in that list.

Deregister Operator.
   Remove a node from the queue, with the operator’s consent, and return
   the ADA bond to the operator. Conditions:

   #. The transaction must Remove a node from the queue. Let be that
      node.

   #. The field of must correspond to a public key hash that signed the
      transaction.

   The operator consents to the transaction, so the ADA bond is assumed
   to be returned to the operator’s control.

Remove Duplicate Slash Bond.
   Remove a node from the queue if its key duplicates the key of any
   other node among the registered, active, or retired operators. Do
   *not* return the duplicate node’s ADA bond to its operator.
   Conditions:

   #. The transaction must Remove a node from the queue. Let that node
      be .

   #. The transaction fees must meet or exceed the protocol parameter,
      denominated in Lovelaces.

   #. Let be one of: , , or .

   #. If is :

      #. The transaction must include a reference input of a node that
         proves the key’s membership in that list.

   #. If is :

      #. The transaction must include the Midgard hub oracle NFT in a
         reference input.

      #. Let be the policy ID in the corresponding field of the Midgard
         hub oracle.

      #. The transaction must include a reference input of a node that
         proves the key’s membership in that list.

   #. If is :

      #. The transaction must include a reference input of a node that
         proves the key’s membership in that list.

   The submitter of the Remove Duplicate Slash Bond transaction is
   considered to be the fraud prover, so the conditions for that
   redeemer do not need to explicitly enforce that the is paid out
   because the submitter consents to the transaction.

.. _h:registered-operators-spending-validator:

Spending validator
~~~~~~~~~~~~~~~~~~

The spending validator of always forwards to its corresponding minting
policy (statically parametrized) and requires the transaction to invoke
it. It does not allow any in-place modifications to the value of the
node field. Conditions:

#. The transaction must mint or burn tokens of the minting policy.

.. _h:active-operators:

Active operators
----------------

The set keeps track of operators after activating and before slashing or
retiring them.

.. _h:active-operators-minting-policy:

Minting policy
~~~~~~~~~~~~~~

The minting policy implements state transitions for its key-ordered
linked list. It is statically parametrized on the , , and minting
policies. Redeemers:

Init.
   Initialize the set via the Midgard hub oracle. Conditions:

   #. The transaction must mint the Midgard hub oracle NFT.

   #. The transaction must Init the set.

Deinit.
   Deinitialize the set via the Midgard hub oracle. Conditions:

   #. The transaction must burn the Midgard hub oracle NFT.

   #. The transaction must Deinit the set.

Activate Operator.
   Transfer an operator node from the queue to the set. Conditions:

   #. The transaction must Insert a node into the set. Let that node be
      .

   #. The field of must be .

   #. The transaction must Remove a node from the queue, as evidenced by
      burning a node NFT corresponding to the key.

Remove Operator Bad State.
   Remove an operator’s node from the set without returning the
   operator’s ADA bond to the operator, as a consequence of committing a
   fraudulent block to the state queue. Conditions:

   #. Let be a redeemer argument indicating the operator being slashed.

   #. The transaction must Remove a node from the set. Let that node be
      .

   #. must match the key of .

   #. The transaction fees must meet or exceed the protocol parameter,
      denominated in Lovelaces.

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let be the policy ID in the corresponding field of the Midgard hub
      oracle.

   #. The transaction must Remove a node from the via the Remove
      Fraudulent Block Header redeemer. The argument provided to that
      redeemer must match .

   The state queue’s onchain code is responsible for disposing of the
   operator’s ADA bond.

Remove Operator Bad Settlement.
   Remove an operator’s node from the set without returning the
   operator’s ADA bond to the operator, as a consequence of attaching a
   fraudulent resolution claim to the settlement queue. Conditions:

   #. Let be a redeemer argument indicating the operator being slashed.

   #. The transaction must Remove a node from the set. Let that node be
      .

   #. must match the key of .

   #. The transaction fees must meet or exceed the protocol parameter,
      denominated in Lovelaces.

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let be the address in the corresponding field of the Midgard hub
      oracle.

   #. The transaction must spend a node from the via the Disprove
      Resolution Claim redeemer. The argument provided to that redeemer
      must match .

   The settlement queue’s onchain code is responsible for disposing of
   the operator’s ADA bond.

Retire Operator.
   Transfer an operator node, unchanged, from the set to the set.
   Conditions:

   #. The transaction must Remove a node from the set. Let that node be
      .

   #. The transaction must Insert a node into the set, as evidenced by
      minting a node NFT corresponding to the key.

   #. Let be the node inserted into the set.

   #. The must match between and .

.. _h:active-operators-spending-validator:

Spending validator
~~~~~~~~~~~~~~~~~~

The spending validator of forwards to its corresponding minting policy
(statically parametrized) when the transaction invokes it. When the
minting policy isn’t invoked, the spending validator updates the bond
unlock time of an operator that commits a new block to the state queue
or attaches a resolution claim to a settlement queue node. Redeemers:

List State Transition.
   Forward to minting policy. Conditions:

   #. The transaction must mint or burn tokens of the minting policy.

Update Bond Hold New State.
   Update an operator’s bond unlock time when they commit a block to the
   state queue. Grouped conditions:

   -  Update the bond unlock time of a operator:

      #. The transaction must *not* mint or burn tokens of the minting
         policy.

      #. Let be an output of the transaction indicated by a redeemer
         argument.

      #. must be an node that matches the datum argument of the spending
         validator on the and fields.

      #. The field of must match the sum of the Midgard parameter and
         the upper bound of the transaction validity interval.

   -  Verify that the operator is currently committing a block header to
      the state queue:

      #. The transaction must include the Midgard hub oracle NFT in a
         reference input.

      #. Let be the policy ID in the corresponding field of the Midgard
         hub oracle.

      #. The transaction must Append a node into the via the Commit
         Block Header redeemer. The redeemer’s field must match the
         field of the .

Update Bond Hold New Settlement.
   Update an operator’s bond unlock time when they attach a resolution
   claim to a settlement node. Grouped conditions:

   -  Update the bond unlock time of a operator:

      #. The transaction must *not* mint or burn tokens of the minting
         policy.

      #. Let be an output of the transaction indicated by a redeemer
         argument.

      #. must be an node that matches the datum argument of the spending
         validator on the and fields.

      #. The field of must match the sum of the Midgard parameter and
         the upper bound of the transaction validity interval.

   -  Verify that the operator is currently committing a block header to
      the state queue:

      #. The transaction must include the Midgard hub oracle NFT in a
         reference input.

      #. Let be the policy ID in the corresponding field of the Midgard
         hub oracle.

      #. The transaction must spend a settlement queue node with the
         Attach Resolution Claim redeemer. The redeemer’s field must
         match the field of the .

.. _h:retired-operators:

Retired operators
-----------------

The set keeps track of operators after retiring and before slashing or
returning their ADA bonds.

.. _h:retired-operators-minting-policy:

Minting policy
~~~~~~~~~~~~~~

The minting policy implements structural operations for its key-ordered
linked list. It is statically parametrized on the minting policy.
Redeemers:

Init.
   Initialize the set via the Midgard hub oracle. Conditions:

   #. The transaction must mint the Midgard hub oracle NFT.

   #. The transaction must Init the set.

Deinit.
   Deinitialize the set via the Midgard hub oracle. Conditions:

   #. The transaction must burn the Midgard hub oracle NFT.

   #. The transaction must Deinit the set.

Retire Operator.
   Transfer an operator node, unchanged, from the set to the set.
   Conditions:

   #. The transaction must Insert a node into the set. Let that node be
      .

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let be the policy ID in the corresponding field of the Midgard hub
      oracle.

   #. The transaction must Remove a node from the set, as evidence by
      the burning of a node NFT corresponding to the key.

   The active operators’ minting policy ensures that the operator node’s
   contents remain unchanged during the transfer.

Recover Operator Bond.
   Remove an operator’s node from the set, with the operator’s consent,
   and return the ADA bond to the operator. Grouped conditions:

   #. The transaction must Remove a node from the set. Let that node be
      .

   #. If the field of is *not* , then the lower bound of the transaction
      validity interval must meet or exceed the .

   The operator consents to the transaction, so the ADA bond is assumed
   to be returned to the operator’s control.

Remove Operator Bad State.
   Remove an operator’s node from the set without returning the
   operator’s ADA bond to the operator. Conditions:

   #. Let be a redeemer argument indicating the operator being slashed.

   #. The transaction must Remove a node from the set. Let that node be
      .

   #. must match the key of .

   #. The transaction fees must meet or exceed the protocol parameter,
      denominated in Lovelaces.

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let be the policy ID in the corresponding field of the Midgard hub
      oracle.

   #. The transaction must Remove a node from the via the Remove
      Fraudulent Block Header redeemer. The argument provided to that
      redeemer must match .

   The state queue’s onchain code is responsible for paying out the
   fraud prover’s reward from the operator’s forfeited ADA bond.

Remove Operator Bad Settlement.
   Remove an operator’s node from the set without returning the
   operator’s ADA bond to the operator, as a consequence of attaching a
   fraudulent resolution claim to the settlement queue. Conditions:

   #. Let be a redeemer argument indicating the operator being slashed.

   #. The transaction must Remove a node from the set. Let that node be
      .

   #. must match the key of .

   #. The transaction fees must meet or exceed the protocol parameter,
      denominated in Lovelaces.

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let be the address in the corresponding field of the Midgard hub
      oracle.

   #. The transaction must spend a node from the via the Disprove
      Resolution Claim redeemer. The argument provided to that redeemer
      must match .

   The settlement queue’s onchain code is responsible for disposing of
   the operator’s ADA bond.

.. _h:retired-operators-spending-validator:

Spending validator
~~~~~~~~~~~~~~~~~~

The spending validator of always forwards to its corresponding minting
policy (statically parametrized) and requires the transaction to invoke
it. It does not allow any in-place modifications to the value of the
node field. Conditions:

#. The transaction must mint or burn tokens of the minting policy.
