.. _h:linked-list:

Linked list
===========

The linked list is a versatile data structure that can implement sets,
queues, key-value maps, lazy data sequences, and other interesting data
structures. It is particularly useful in the extended UTXO model of the
Cardano blockchain, where many list operations and queries can be
validated onchain within minimal local contexts that do not grow with
list size. Meanwhile, offchain queries can access any part of the list
via beacon NFTs that pinpoint specific list nodes.

We describe two types of linked lists:

-  The **key-unordered** linked list is a cheaper/simpler variant that
   only allows nodes to be appended at the end of the list and does not
   enforce the order of keys in the list. It can be used to implement
   queues and other sequential data structures. However, appending to a
   list is a sequential operation, which is unsuitable for applications
   that need multiple independent actors to grow the list
   simultaneously.

-  The **key-ordered** linked list allows nodes to be inserted anywhere
   in the list, but it applies additional rules to maintain the
   key-ascending order of nodes. It can be used to implement sets and
   key-value maps. List insertion is increasingly parallel as the list
   grows, so the key-ordered linked list is well-suited to applications
   with multiple independent actors growing the list (see
   `1.12 <#h:parallel-insertions-in-key-ordered-lists>`__).

.. _h:list-utxo-representation:

Utxo representation
-------------------

Each linked list, whether key-ordered or key-unordered, is represented
in the blockchain ledger as a collection of node utxos that hold node
NFTs minted by the list’s minting policy and are held under the list’s
spending validator. The spending validator is parameterized by the
minting policy, and the minting policy is parameterized by the utxo
reference of one of the spent inputs in the transaction that initializes
the list.

Each node utxo of a list uniquely corresponds to some key and holds a
node NFT with a token name equal to that key’s serialization. The
key-ordered list’s state transitions guarantee that all nodes have
unique keys, but the key-unordered list’s state transitions only assume
that keys are unique.

An application using a key-unordered list MUST only add nodes with
unique keys to the list. Duplicate keys break the linked list data
structure.

Every node utxo has a datum of the type, which is parametric on the type
of the non-key data that is to be stored in the list nodes:

.. math::

   \T{NodeDatum} (\T{app\_data}) \coloneq \left\{
       \begin{array}{ll}
           \T{key}  : & \T{Option}(\T{ByteArray}) \\
           \T{link} : & \T{Option}(\T{ByteArray}) \\
           \T{data} : & \T{app\_data}
       \end{array} \right\}

The field indicates the node’s key (or for the root node).  [1]_ It must
match the token name of the node’s NFT when serialized: [2]_

.. math::

   \begin{aligned}
       \T{serialize\_key} (\T{None}) &\coloneq \T{``Node''} \\
       \T{serialize\_key} (\T{Some} (\T{key})) &\coloneq \T{concat(``Node'', key)} \end{aligned}

The root node of a list is the only node with a field value of in its
and its NFT token name set to . The root node is created when a list is
initialized and must continue to exist until the list is deinitialized.
This allows an initialized but empty list to be represented by just its
root node (and no other nodes). The non-root nodes represent the actual
keys and data of interest within a non-empty list.

The field is a link to the next key that a forward traversal through the
list must visit after visiting the current node. Alternatively, the
field can be interpreted as the previous key that a backward traversal
through the list has visited before the current node. The last node is
the only node with a field value of because forward traversal through
the list must end after this node (backward traversal must start at this
node).

The field is parametric on the type set by the application that
instantiates the list. It is reserved for use by the application’s
custom onchain code.

.. _h:list-library-structure:

Linked list library structure
-----------------------------

The linked list library provides a collection of *rules* that enforce
the baseline behavior of linked lists. An application using the list
data structure should invoke one of these rules whenever it needs a
particular linked list operation to occur within the context of the
application’s custom state transitions.

Linked list rules are predicate functions that can be freely composed
with any custom application rules via logical conjunction. In this way,
while the linked list rules control which operations can be performed on
a list and how they must be performed, applications can apply further
constraints on the circumstances under which the operations are allowed.

The state transition rules control how lists are
initialized/deinitialized and how nodes are added/removed from the list.
These rules should be invoked in the application’s minting policy for
the list because every state transition of the list changes the number
of list nodes, so it must necessarily mint or burn node NFTs.

The state integrity rules ensure that node NFTs stay in their respective
node utxos until burned and that the and fields remain unchanged outside
of linked list state transitions. These rules should be invoked in the
application’s spending validator for the list.

Neither the state transition nor the state integrity rules inspect the
field of node utxos, nor do they inspect the value held by node utxos
besides node NFTs. Applications are free to use these as they wish.

describes how to instantiate a linked list within an application and
compose the linked list rules with custom app rules.

.. _h:list-state-integrity-rules:

State integrity rules
---------------------

The state integrity rules distinguish between transactions that apply
linked list state transitions and transactions that merely modify the
field or non-node-NFT value of a node utxo.

List State Transition.
   This rule allows a node utxo to be spent in any transaction that
   applies a state transition to the list. Conditions:

   #. Tokens of the list’s minting policy must be minted or burned.

Modify Data.
   This rule ensures that the node NFT, the field, and the field remain
   unchanged in any transaction that does not apply a state transition
   to the list. It achieves it as follows:

   #. Tokens of the list’s minting policy must *not* be minted or
      burned.

   #. Let be the node utxo input for which this rule is being evaluated.

   #. Let be an output of the transaction indicated by a redeemer
      argument of the spending validator.

   #. The node NFT of the list must be present in .

   #. The value must match in and .

   #. The and fields must match in and .

   To keep the onchain code simple and efficient, this rule can only
   handle content modifications to one node utxo per list. In principle,
   this could be generalized to handle bulk modifications of node
   contents, but that would require more expensive computations to match
   node inputs with node outputs.

.. _h:list-subcontext:

List subcontext for state transition rules
------------------------------------------

State transition rules of a linked list are only concerned with a
transaction’s effects on the list’s node utxos. Consequently, they focus
on the following linked list subcontext, which is a subset of the
overall transaction context:

-  is the minting policy ID of the list.

-  is the map of tokens of the list’s minting policy that were minted or
   burned.

-  are the transaction inputs that hold node NFTs of the list and datums
   that parse as .

-  are the transaction outputs that hold node NFTs of the list and
   datums that parse as .

The state transition rules ignore the rest of the transaction context,
which does not affect the state of the list. However, applications
invoking the state transition rules are free to consider the whole
transaction context to constrain the circumstances under which they
allow linked list state transitions to occur.

.. _h:list-node-key-predicates:

Node and key predicates
-----------------------

The following predicate functions characterize nodes and keys in a
linked list subcontext relative to the global state of the list.

Root node.
   The root node of the list:

   .. math::

      \begin{aligned}
                  \T{is\_root\_node} (\T{node}) &\coloneq
                    ( \T{node.datum.key} \equiv \T{None} )
              \end{aligned}

Last node.
   The last node of the list:

   .. math::

      \begin{aligned}
                  \T{is\_last\_node} (\T{node}) &\coloneq
                    ( \T{node.datum.link} \equiv \T{None} )
              \end{aligned}

Empty list.
   The list is empty if its root node is also its last node:

   .. math::

      \T{is\_root\_node}(\T{node}) \land
                  \T{is\_last\_node}(\T{node})

Key added.
   The transaction only affects the list by adding the given key:

   .. math::

      \begin{aligned}
                  \T{key\_added} (\T{key}, \T{node\_cs}, \T{node\_mint}) &\coloneq
                      \Bigl( \T{without\_lovelace}(\T{node\_mint}) \\ &\qquad\equiv
                        \T{from\_asset}(\T{node\_cs}, \T{serialize\_key}(\T{key}), 1)
                      \Bigr)
              \end{aligned}

Key removed.
   The transaction only affects the list by removing the given key:

   .. math::

      \begin{aligned}
                  \T{key\_removed} (\T{key}, \T{node\_cs}, \T{node\_mint}) &\coloneq
                      \Bigl( \T{without\_lovelace}(\T{node\_mint}) \\ &\qquad\equiv
                        \T{from\_asset}(\T{node\_cs}, \T{serialize\_key}(\T{key}), -1)
                      \Bigr)
              \end{aligned}

Key membership.
   The given key is a member of the list, proved by the existence of a
   witness node that satisfies the following predicate for the key.

   .. math::

      \begin{aligned}
                  \T{is\_member} (\T{key}, \T{node}) &\coloneq
                    ( \T{key} \equiv \T{node.datum.key} )
              \end{aligned}

   -  When the above predicate is satisfied by a transaction input, it
      means that the key is a member of the list immediately before the
      transaction.

   -  When the above predicate is satisfied by a transaction output, it
      means that the key is a member of the list immediately after the
      transaction.

Key non-membership (ordered lists only!).
   The given key is *not* a member of the list, as proved by the
   existence of witness a node that satisfies the following predicate
   for the key:

   .. math::

      \begin{aligned}
                  &\T{is\_non\_member} (\T{None}, \T{\_node}) \coloneq \T{False} \\
                  &\T{is\_non\_member} (\T{Some}(\T{key}), \T{node}) \coloneq \\
                  &\qquad
                      \Bigl( \T{is\_root\_node} (\T{node}) 
                          \lor (\T{node.datum.key} < \T{Some}(\T{key})) \Bigr) \\
                  &\qquad\qquad\land
                      \Bigl( \T{is\_last\_node} (\T{node}) 
                          \lor (\T{Some}(\T{key}) < \T{node.datum.link}) \Bigr)
              \end{aligned}

   -  When the above predicate is satisfied by a transaction input, it
      means that the key is not a member of the list immediately before
      the transaction.

   -  When the above predicate is satisfied by a transaction output, it
      means that the key is not a member of the list immediately after
      the transaction.

   In human terms, the key non-membership proof describes four possible
   scenarios in which a key is not a member of a key-ordered list:

   #. The list is empty.

   #. The root node links to a node with a higher key than the given
      key, which precludes the given key’s membership because all
      subsequent nodes visited after this node will have monotonically
      increasing keys.

   #. The last node has a key lower than the given key, which precludes
      the given key’s membership because all nodes visited before the
      last node have even smaller keys.

   #. A non-root non-last node has a lower key but links to a higher key
      than the given key, which precludes the given key’s membership
      because all nodes before this node have smaller keys, and all
      nodes after this node have larger keys.

   For a key-unordered list, the only way to prove the non-membership of
   a key is to iterate over the entire list in the transaction inputs,
   which quickly becomes infeasible for lists larger than the empty
   list. The predicate does *not* apply to key-unordered lists.

.. _h:indexing-into-a-list:

Indexing into a list
--------------------

The main way to index into a list is by key. Every linked list, whether
key-ordered or key-unordered (if its keys are unique), has a canonical
surjective mapping from its domain of all possible keys onto the nodes
it contains:

-  If a given key is a member of the list, it is mapped to the node that
   proves its membership.

-  Otherwise, the key is mapped to the node that proves its
   non-membership.

In the offchain context, indexing by key requires traversing the list to
the node that proves the key’s membership or non-membership. However,
indexing by key is cheap in the onchain context because only that single
node needs to be an input to the transaction.

The other way to index into a list is by position, which requires
traversing the list to the node at that position in both the offchain
and onchain contexts. The root and last nodes are the cheapest to reach
because they intrinsically define their positions within the list, so
inspecting any other nodes is unnecessary.

The first and second-last nodes are the next cheapest to reach because
they are adjacent to the root and last nodes, respectively. This means
that the root node must be an input when indexing into the first node,
while the last node must be an input when indexing into the second-last
node. The farther a node is from the root or last node, the larger this
chain of inputs grows to establish its position in the list.

.. _h:onchain-traversal-list:

Onchain traversal of a list
---------------------------

In the onchain context, read-only traversal through a list is more
efficient backwards than forwards when the only thing that the traversal
needs to know about the previously visited node is its key. In that
case, backward traversal only needs the current node to be a transaction
input because the current node’s field matches the key of the previously
visited node.

By contrast, read-only forward traversal requires both nodes to be
transaction inputs because it only knows which node it should be
visiting by inspecting the previously visited node’s field. Of course,
the traversal state could instead keep a copy of the field of the
previously visited node, but that copy can become stale if the list is
not kept immutable during the traversal.

On the other hand, forward traversal is more efficient when the list is
destructively folded into an accumulator that is stored at the root
node. In that case, the root node needs to be updated anyway, and it
always points to the next node that the traversal should visit.

.. _h:key-unordered-list:

Key-unordered linked list
-------------------------

The key-unordered linked list data structure does *not* keep its nodes
ordered by their keys. This means that a new node cannot be added to the
list based on its key because the list does not require the key to be
positioned after any particular node in the list.

This leaves only adding new nodes to the list at specific absolute
positions. We restrict these positions even further to just the
beginning and end of the list because other positions would require
increasingly larger chains of reference inputs to establish the new
node’s position.

Therefore, the key-unordered linked list data structure allows new nodes
to be added to the beginning or end of the list, while non-root nodes
can be removed anywhere in the list. It enforces the following
properties:

#. The root node exists continuously until the list is initialized.

#. If the keys in the list are unique, then each node has only one node
   linking to it.

#. If the keys in the list are unique, then traversal through the list
   is deterministic.

.. _h:key-unordered-list-state-transition-rules:

State transition rules
~~~~~~~~~~~~~~~~~~~~~~

Init.
   Initialize an empty list. Conditions:

   #. The transaction’s sole effect on the list is to add the root key.

      .. math:: \T{key\_added}(\T{None}, \T{node\_cs}, \T{node\_mint})

   #. The list must be empty after the transaction, as proved by an
      output that holds the minted root node NFT.

      .. math::

         \T{is\_empty\_list}(\T{root\_node})  \land
                             \T{has\_token}(\T{root\_node}, \T{node\_cs}, \T{``Node''})

   #. The must not contain any other non-ADA tokens.

   The above conditions imply the following:

   -  must be a singleton. This is implied by the list being empty after
      the transaction, the root node NFT being minted, and no other node
      tokens being minted or burned.

   -  is empty. This is implied by the root node NFT of the list being
      minted in the transaction. If list keys are unique, no other node
      can exist before the root node. This is enforced by the other
      state transition rules, which (inductively) require the existence
      of the root node before and after any other node NFTs are created
      or burned.

   The Init rule cannot enforce that the root node utxo is sent to the
   spending validator that contains the state integrity rules of the
   list because that spending validator is parametrized on the minting
   policy that includes the Init rule.

   Offchain code for the list-initialization transaction MUST send the
   root node to the list’s spending validator. Otherwise, the linked
   list can be corrupted.

Deinit.
   Deinitialize an empty list. Conditions:

   #. The transaction’s sole effect on the list is to remove the root
      key.

      .. math:: \T{key\_removed}(\T{None}, \T{node\_cs}, \T{node\_mint})

   #. The list must be empty before the transaction, as proved by an
      input that holds the minted root node NFT.

      .. math::

         \T{is\_empty\_list}(\T{root\_node}) \land
                             \T{has\_token}(\T{root\_node}, \T{node\_cs}, \T{``Node''})

   The above conditions imply the following:

   -  must be a singleton. This is implied by the empty list before the
      transaction.

   -  must be empty. This is implied by the condition that the root node
      NFT is burned and that no other node tokens are minted or burned.

Prepend (unsafe).
   Prepend a new node to the beginning of the list. Grouped conditions:

   -  Verify the mint:

      #. Let be the key being prepended.

      #. The transaction’s sole effect on the list is to add .

         .. math:: \T{key\_added}(\T{key\_to\_prepend}, \T{node\_cs}, \T{node\_mint})

   -  Verify the inputs:

      #. must be a singleton. Let be its sole node.

      #. must be the root node of the list.

   -  Verify the outputs:

      #. must have exactly two nodes:

         -  
         -  

      #. must be a member of the list after the transaction, as
         witnessed by .

         .. math:: \T{is\_member} (\T{key\_to\_prepend}, \T{prepended\_node})

      #. and must match on the field. In other words, they must both
         link to the same key.

      #. must link to .

      #. must not contain any other non-ADA tokens.

   -  Verify immutable data:

      #. must match on address, value, and datum except for the field.

      #. must match on address.

   This rule is considered unsafe because it does *not* enforce key
   uniqueness or key order in the list. It merely assumes that the key
   being prepended is unique.

   An application using a key-unordered list MUST only add nodes with
   unique keys to the list. Duplicate keys break the linked list data
   structure.

Append (unsafe).
   Append a new node to the end of the list. Conditions:

   -  Verify the mint:

      #. Let be the key being appended.

      #. The transaction’s sole effect on the list is to add .

         .. math:: \T{key\_added}(\T{key\_to\_append}, \T{node\_cs}, \T{node\_mint})

   -  Verify the inputs:

      #. must be a singleton. Let be its sole node.

      #. must be the last node of the list before the transaction.

   -  Verify the outputs:

      #. must have exactly two nodes:

         -  
         -  

      #. must be a member of the list after the transaction, as
         witnessed by .

         .. math:: \T{is\_member} (\T{key\_to\_append}, \T{appended\_node})

      #. must be the last node of the list after the transaction.

      #. must link to .

      #. must not contain any other non-ADA tokens.

   -  Verify immutable data:

      #. must match on address, value, and datum except for the field.

      #. must match on address.

   This rule is considered unsafe because it does *not* enforce key
   uniqueness or key order in the list. It merely assumes that the key
   being appended is unique.

   An application using a key-unordered list MUST only add nodes with
   unique keys to the list. Duplicate keys break the linked list data
   structure.

Remove.
   Remove a non-root node from the list. Conditions:

   -  Verify the mint:

      #. Let be the key being removed.

      #. The transaction’s sole effect on the list is to remove .

         .. math:: \T{key\_removed}(\T{key\_to\_remove}, \T{node\_cs}, \T{node\_mint})

   -  Verify inputs:

      #. must have exactly two nodes:

         -  
         -  

      #. must be a member of the list before the transaction, as
         witnessed by .

         .. math:: \T{is\_member} (\T{key\_to\_remove}, \T{removed\_node})

      #. must link to .

   -  Verify outputs:

      #. must be a singleton. Let be its sole node.

      #. and must match on the field. In other words, they must both
         link to the same key.

   -  Verify immutable data:

      #. must match on address, value, and datum except for the field.

.. _h:key-ordered-list:

Key-ordered linked list
-----------------------

The key-ordered linked list data structure replaces the unsafe Append
rule of the key-unordered linked list with the safe Insert rule. It
re-uses the rest of the key-unordered linked list rules, as these rules
cannot cause a key-ordered list to become key-unordered. It enforces the
following properties:

#. The root node exists continuously until the list is deinitialized.

#. Each node has a unique key.

#. Each key has only one node linking to it.

#. Traversal through the list is deterministic and follows key-ascending
   order.

.. _h:key-ordered-list-state-transition-rules:

State transition rules
~~~~~~~~~~~~~~~~~~~~~~

Init.
   Same as Init for key-unordered lists.

   Offchain code for the list-initialization transaction MUST send the
   root node to the list’s spending validator. Otherwise, the linked
   list can be corrupted.

Deinit.
   Same as Deinit for key-unordered lists.

Prepend (safe).
   Same as Prepend for key-unordered lists, but with an additional
   condition:

   -  must *not* be a member of the list before the transaction, as
      witnessed by .

      .. math:: \T{is\_not\_member} (\T{key\_to\_prepend}, \T{anchor\_node\_input})

   The above condition enforces key uniqueness and order in the list,
   making this version of Prepend safe.

Append (safe).
   Same as Append for key-unordered lists, but with an additional
   condition:

   -  must *not* be a member of the list before the transaction, as
      witnessed by .

      .. math:: \T{is\_not\_member} (\T{key\_to\_append}, \T{anchor\_node\_input})

   The above condition enforces key uniqueness and order in the list,
   making this version of Append safe.

Insert.
   Insert a node into the list. Grouped conditions:

   -  Verify mint:

      #. Let be the key being inserted.

      #. The transaction’s sole effect on the list is to add .

         .. math:: \T{key\_added}(\T{key\_to\_insert}, \T{node\_cs}, \T{node\_mint})

   -  Verify inputs:

      #. must be a singleton. Let be its sole node.

      #. must *not* be a member of the list before the transaction, as
         witnessed by .

         .. math:: \T{is\_not\_member} (\T{key\_to\_insert}, \T{anchor\_node\_input})

   -  Verify outputs:

      #. must have exactly two nodes:

         -  
         -  

      #. must be a member of the list after the transaction, as
         witnessed by .

         .. math:: \T{is\_member} (\T{key\_to\_insert}, \T{inserted\_node})

      #. must link to .

      #. and must match on the field. In other words, they must both
         link to the same key.

      #. must not contain any other non-ADA tokens.

   -  Verify immutable data:

      #. must match on address, value, and datum except for the field.

      #. must match on address.

   Unlike the Append rule, the Insert rule is safe because it enforces
   key uniqueness and key order in the list:

   -  Key uniqueness is achieved by the inserted key’s pre-transaction
      non-membership.

   -  Key order is achieved by requiring both and to link to the same
      key. The key non-membership condition implies that this common
      linked key is higher than , which means that complies with the key
      order.

Remove.
   Same as Remove for key-unordered lists.

.. _h:instantiate-list-in-application:

Instantiate a linked list in an application
-------------------------------------------

An application that uses a linked list should ensure that it uses the
appropriate state transition rules when creating/destroying node utxos
of the list or otherwise modifying the or field value of any nodes. The
application can attach additional rules that constrain the circumstances
under which it allows list state transitions based on the list
subcontext or the full transaction context. Moreover, the application
has complete and exclusive control over the app-specific field of list
nodes, for which it also defines the data type.

As a general good practice, applications should limit the number of
different non-node tokens and the size of app-specific data placed into
node utxo when new nodes are inserted and when app-specific data is
modified. This avoids token dust and large data attacks that could
result in deadlock when certain list operations cannot fit within
transactions’ compute, memory, or space constraints.

Midgard uses linked lists throughout its onchain architecture:

-  (`[h:registered-operators] <#h:registered-operators>`__)

-  (`[h:active-operators] <#h:active-operators>`__)

-  (`[h:retired-operators] <#h:retired-operators>`__)

-  (`[h:state-queue] <#h:state-queue>`__)

-  (`[h:fraud-proof-catalogue] <#h:fraud-proof-catalogue>`__)

.. _h:list-different-data-in-root:

Different data in root node
---------------------------

An application that needs to store different data in the root node than
in non-root nodes of a list can use an app-specific type with multiple
constructors (i.e., a sum type) in the field of the list’s .

.. math::

   \begin{aligned}
       \T{MyNodeDatum} &\coloneq \T{NodeDatum} (\T{MyAppData}) \\
       \T{MyAppData} &\coloneq \T{Root}(\T{MyRootData}) \;|\; \T{Node}(\T{MyNodeData})\end{aligned}

The application’s onchain code should ensure that root and non-root
nodes always use their respective constructors.

.. _h:parallel-insertions-in-key-ordered-lists:

Parallel insertions in key-ordered lists
----------------------------------------

For keys randomly sampled from an approximately uniform distribution
(e.g., cryptographic public keys for wallets), insertion/removal from a
key-ordered linked list is parallel to a degree proportional to the
list’s size, with parallelism increasing as the list grows.

An application may expect highly parallel traffic (e.g., from
simultaneous interactions of independent users) before its list grows
from its initially small size. This can be alleviated by using
“separator” nodes in the list, which boost the list’s parallelism by
virtually occupying specific keys. Ideally, separators should be evenly
spaced throughout the key space of the list.

.. math::

   \begin{aligned}
       \T{MyNodeDatum} &\coloneq \T{NodeDatum} (\T{MyAppDataWithSeps}) \\
       \T{MyAppDataWithSeps} &\coloneq \T{Root}(\T{MyRootData}) \;|\;
           \T{Node}(\T{MyNodeData}) \;|\;
           \T{Separator}\end{aligned}

Suppose the application needs to insert a node at a key occupied by a
separator node. In that case, it will instead modify the node contents
(see `1.3 <#h:list-state-integrity-rules>`__) of the separator node to
the intended field value of the inserted node. Otherwise, node insertion
works as usual.

The application can insert or remove separators as needed during the
lifecycle of the list to regulate its parallelism.

.. [1]
   The key field is redundant, as it is already represented in the node
   NFT, but we include it in the datum for convenience in onchain
   scripts and offchain analytics.

.. [2]
   Prefixing the key when it is serialized to the token name prevents a
   collision between the root node and a node with an empty key string.
   It also allows more flexibility for minting policies that use the
   linked list library to atomically mint additional tokens associated
   with the key but namespaced from the node NFTs. Alternatively, if
   this functionality is not needed, the “Node” prefixes can be removed
   from the serialization.
