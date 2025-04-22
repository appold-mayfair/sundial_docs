.. _h:block:

Block
=====

A block consists of a header hash, a header, and a block body:

.. math::

   \begin{aligned}
   \T{Block} \coloneq \{ & \\
       & \T{header\_hash} : \T{HeaderHash}, \\
       & \T{header} : \T{Header}, \\
       & \T{block\_body} : \T{BlockBody} \\
   \}
   \end{aligned}

The block body contains the block's transactions, deposits, and withdrawals, along with
the unspent outputs that result from applying the block's transition to the previous block's unspent outputs.

.. math::

   \begin{aligned}
   \T{BlockBody} \coloneq \{ & \\
       & \T{utxos} : \T{UtxoSet}, \\
       & \T{transactions} : \T{TxSet}, \\
       & \T{deposits} : \T{DepositSet}, \\
       & \T{withdrawals} : \T{WithdrawalSet} \\
   \}
   \end{aligned}

The block’s ``utxos`` are derived from the previous block’s ``utxos`` by applying the block’s events.
Withdrawals are applied before transactions, which are applied before deposits.

.. note::

   A block is serialized and stored on Midgard’s data availability layer.
   During serialization, each set in the block body is serialized as a sequence of
   key-value pairs, sorted by the unique key of each element.

Only the header hash and header are stored on Cardano L1.
This is sufficient because the header specifies Merkle Patricia Trie (MPT) root hashes
for each of the sets in the block body. These root hashes can be verified onchain by streaming
over the corresponding set’s elements, hashing them, and calculating the root iteratively.

The MPT representation of a block’s transactions is structured as follows:

.. math::

   (\T{TxId}_i, \T{MidgardTx}_i) \Rightarrow D_i,\quad L_i = \mathcal{H}(D_i)

.. math::

   N_{ij} = \mathcal{H}(L_i \Vert L_j)

.. math::

   \T{transactions\_root} = \mathcal{H}(N_{12} \Vert N_{34})

(See the documentation figures for a graphical view.)

.. _h:block-header:

Block header
------------

A block header is a fixed-size record of integers, hashes, and bytestrings.
The block header hash is 28 bytes and is computed via Blake2b-224.

.. math::

   \T{HeaderHash} = \mathcal{H}_\T{Blake2b-224}(\T{Header})

.. math::

   \begin{aligned}
   \T{Header} \coloneq \{ & \\
       & \T{prev\_utxos\_root} : \T{RootHash}, \\
       & \T{utxos\_root} : \T{RootHash}, \\
       & \T{transactions\_root} : \T{RootHash}, \\
       & \T{deposits\_root} : \T{RootHash}, \\
       & \T{withdrawals\_root} : \T{RootHash}, \\
       & \T{start\_time} : \T{PosixTime}, \\
       & \T{end\_time} : \T{PosixTime}, \\
       & \T{prev\_header\_hash} : \T{HeaderHash}, \\
       & \T{operator\_vkey} : \T{VerificationKey}, \\
       & \T{protocol\_version} : \T{Int} \\
   \}
   \end{aligned}

**Field interpretations:**

- ``*_root``: MPT root hashes of block body sets.
- ``prev_utxos_root``: Copy of previous block’s ``utxos_root``, for fraud proof verification.
- ``start_time``, ``end_time``: Event interval bounds (see :ref:`h:time-model`).
- ``prev_header_hash``: Blake2b-224 hash of previous block header. Zeroed for genesis block.
- ``operator_vkey``: Signature key of the block-producing operator.
- ``protocol_version``: Version of the Midgard protocol active at this block.