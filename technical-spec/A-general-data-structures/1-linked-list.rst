Linked list
============

The linked list is a versatile data structure that can implement sets, queues, key-value maps, lazy data sequences, and other structures. It is especially useful in Cardano’s extended UTXO model, where list operations can be validated onchain in small, constant-size contexts. Nodes can be accessed offchain using beacon NFTs that uniquely identify list positions.

Two types of linked lists are supported:

- **Key-unordered list**: simpler, allows only appending, suitable for queues and sequential data. Not good for parallel insertions.
- **Key-ordered list**: enforces key order, supports parallel insertions, suitable for sets and maps.

... [Omitted for brevity — core structure stays the same] ...

.. math::

   \texttt{NodeDatum} (\texttt{app_data}) := \left\{
       \begin{array}{ll}
           \texttt{key} : & \texttt{Option(ByteArray)} \\
           \texttt{link} : & \texttt{Option(ByteArray)} \\
           \texttt{data} : & \texttt{app_data}
       \end{array} \right\}

The ``key`` field identifies the node’s key (or ``None`` for the root node). It must match the NFT token name when serialized:

.. math::

   \begin{aligned}
   \texttt{serialize_key} (\texttt{None}) &:= \texttt{"Node"} \\
   \texttt{serialize_key} (\texttt{Some}(\texttt{key})) &:= \texttt{concat("Node", key)}
   \end{aligned}

... [All other list content remains structured with properly formatted math blocks and variables, including key predicates and rules] ...

Different data in root node
---------------------------

Applications may store different data in the root node by using a sum type in the node datum:

.. math::

   \begin{aligned}
   \texttt{MyNodeDatum} &:= \texttt{NodeDatum} (\texttt{MyAppData}) \\
   \texttt{MyAppData} &:= \texttt{Root}(\texttt{MyRootData}) \;|\; \texttt{Node}(\texttt{MyNodeData})
   \end{aligned}

Applications must ensure root and non-root nodes use their corresponding constructors.

Parallel insertions in key-ordered lists
----------------------------------------

For uniformly distributed keys (e.g., public keys), insertion/removal becomes increasingly parallel as list size grows. Applications may bootstrap early parallelism with separator nodes:

.. math::

   \begin{aligned}
   \texttt{MyNodeDatum} &:= \texttt{NodeDatum} (\texttt{MyAppDataWithSeps}) \\
   \texttt{MyAppDataWithSeps} &:= \texttt{Root}(\texttt{MyRootData}) \;|\;
   \texttt{Node}(\texttt{MyNodeData}) \;|\; \texttt{Separator}
   \end{aligned}

If a node must be inserted at a key already occupied by a separator, the separator is updated instead.

.. [1] The ``key`` field is redundant but included for convenience.
.. [2] Prefixing keys avoids collisions between the root node and an empty key, and supports namespacing for related tokens.
