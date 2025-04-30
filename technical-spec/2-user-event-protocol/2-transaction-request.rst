Transaction request (L2)
========================

A user’s primary method of transacting on the Sundial ledger is to
submit an L2 transaction directly to the current operator via a
web-based API endpoint. Operators are expected to serve such APIs in a
publicly accessible and employ sufficient security techniques to
mitigate denial-of-service.

Users’ L2 transactions follow the data structure defined in
`[h:Sundial-transaction-types] <#h:Sundial-transaction-types>`__. In
particular, users can freely set transaction time-validity intervals
according to their preferences. As long as there is a non-empty overlap
between a transaction’s time-validity interval and a block’s event
interval, the transaction can be included in the block. Since event
intervals are adjacent to each other, a user’s valid transaction request
can only miss the ledger in two cases:

-  The operator censors it (see mitigation in
   `[h:transaction-order] <#h:transaction-order>`__).

-  The operator commits the last block overlapping with the transaction
   before receiving the transaction request. [1]_

By contrast, L1 transactions on Cardano can fail in several other
time-related ways. Ouroboros blocks only occupy every 20th one-second
slot on average and have limited transaction capacity. This means that
users often have to set longer transaction validity intervals than they
want and wait for many block confirmations of their tx before relying on
its outcomes.

However, while on Cardano L1 two transactions with non-overlapping
validity intervals cannot be included in the same block, the analogous
L2 transactions *can* be included in a Sundial block if its event
interval overlaps each transaction. Thus, transaction validity intervals
on Sundial define only the relation between transactions and blocks but
do not necessarily imply a temporal precedence relation between
transactions.

.. [1]
   Note that this case does not preclude transactions with short
   time-validity intervals from succeeding. For example, a transaction
   post-dated a couple of minutes in the future can still be included in
   a block even if its validity interval’s duration is one millisecond.
