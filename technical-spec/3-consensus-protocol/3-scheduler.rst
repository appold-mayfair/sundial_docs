.. _h:scheduler:

Scheduler
=========

The Midgard scheduler is an L1 mechanism that indicates which operator
is assigned to the current shift and controls the transitions to the
next shift and next operator. Whenever a shift ends, the next operator
in key-descending order from the list has the exclusive privilege to
advance the scheduler’s state to the next shift, assigning it to
themself.

When the root node of is reached, the highest-key active operator
rewinds the scheduler to start a new cycle. However, the scheduler
requires the queue to be checked to see if any registered operators are
eligible to activate. If so, all eligible registered operators must
activate before the new cycle can begin.

Active operators can retire anytime without waiting for the end of the
scheduler cycle. The scheduler automatically adjusts to retirement
because the next operator is always selected among active operators.
However, to minimize disruption, an operator should complete their shift
before retiring.

.. _h:scheduler-utxo-representation:

Utxo representation
-------------------

The scheduler state consists of a single utxo that holds the scheduler
NFT, minted when Midgard is initialized and burned when Midgard is
deinitialized via the hub oracle. That utxo’s datum type is as follows:

.. math::

   \T{SchedulerDatum} \coloneq \left\{
       \begin{array}{ll}
           \T{operator}  : & \T{PubKeyHash} \\
           \T{shift\_start} : & \T{PosixTime}
       \end{array} \right\}

The shift’s inclusive lower bound is , and its exclusive upper bound is
the sum of and the Midgard protocol parameter.

.. _h:scheduler-minting-policy:

Minting policy
--------------

The minting policy initializes and deinitializes the scheduler state. It
is statically parametrized on the minting policy. Redeemers:

Init.
   Initialize the via the Midgard hub oracle. Conditions:

   #. The transaction must mint the Midgard hub oracle token.

   #. The transaction must mint the NFT.

Deinit.
   Deinitialize the via the Midgard hub oracle. Conditions:

   #. The transaction must burn the Midgard hub oracle token.

   #. The transaction must burn the NFT.

.. _h:scheduler-spending-validator:

Spending validator
------------------

The spending validator of controls the evolution of the scheduler state.
It is statically parametrized on the and minting policies. Redeemers:

Advance.
   The next operator in key-descending order advances the scheduler to
   the next shift and assigns it to themself. Grouped conditions:

   -  Parse scheduler input and output:

      #. Let be the datum argument for the spending validator being
         evaluated. It is assumed to belong to the transaction input
         that holds the scheduler NFT.

      #. Let be the transaction output that holds the scheduler NFT.

      #. Let be the field value of .

      #. Let be the field value of .

   -  Verify the shift transition:

      #. The shift interval of must equal that of , moved forward by .

   -  Verify operator consent:

      #. Either of the following must hold:

         #. The transaction is signed by , and the shift interval
            contains the transaction validity interval.

         #. The shift interval occurs entirely before the transaction
            validity interval.

   -  Verify the operator transition:

      #. The transaction must include a reference input of an node. Let
         be that node.

      #. The of must match .

      #. The of must match or exceed . [1]_

Rewind.
   The highest-key operator advances the scheduler to the next shift and
   assigns it to themself, provided that no registered operators are
   eligible to activate. Grouped conditions:

   -  Parse scheduler input and output:

      #. Let be the datum argument for the spending validator being
         evaluated. It is assumed to belong to the transaction input
         that holds the scheduler NFT.

      #. Let be the transaction output that holds the scheduler NFT.

      #. Let be the field value of .

      #. Let be the field value of .

   -  Verify the shift transition:

      #. The shift interval of must equal that of , moved forward by .

   -  Verify operator consent:

      #. Either of the following must hold:

         #. The transaction is signed by , and the shift interval
            contains the transaction validity interval.

         #. The shift interval occurs entirely before the transaction
            validity interval.

   -  Rewind to a new operator cycle:

      #. The transaction must include a reference input of the last
         node. Let be that node.

      #. The transaction must include a reference input of the root
         node. Let be that node.

      #. The of must match .

      #. The of must match or exceed .  [2]_

   -  Verify that no registered operator is eligible to activate:

      #. The transaction must include a reference input of a node. Let
         be that node.

      #. must be the last node of the queue. This means it corresponds
         to the *earliest* registrant that hasn’t yet activated because
         new registrants are prepended to the beginning of that queue.

      #. is *not yet* eligible for activation — the upper bound of the
         transaction validity interval is smaller than the of the .

.. [1]
   It will exceed the previous operator if they have retired.

.. [2]
   In other words, this means that there is no node with a smaller key
   than . If there were such a node, then we would advance the scheduler
   to that node instead of rewinding.
