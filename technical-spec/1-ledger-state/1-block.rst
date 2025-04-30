Block
=====

A block consists of a header hash, a header, and a block body:

.. math::

   \texttt{Block} := \left\{ \begin{array}{ll}
       \texttt{header\_hash} : & \texttt{HeaderHash} \\
       \texttt{header} : & \texttt{Header} \\
       \texttt{block\_body} : & \texttt{BlockBody}
   \end{array} \right\}

The block body contains the block's transactions, deposits, and withdrawals, along with
the unspent outputs that result from applying the block's transition to the previous block's unspent outputs.

.. math::

   \texttt{BlockBody} := \left\{ \begin{array}{ll}
       \texttt{utxos} : & \texttt{UtxoSet} \\
       \texttt{transactions} : & \texttt{TxSet} \\
       \texttt{deposits} : & \texttt{DepositSet} \\
       \texttt{withdrawals} : & \texttt{WithdrawalSet} \\
   \end{array} \right\}

.. figure:: ../images/block-transition.svg
   :alt: Block transition diagram
   :align: center

   A block's transition from a previous block's utxo set to a new utxo set. Withdrawals are applied before transactions, which are applied before deposits.

The block is what gets serialized and stored on Sundial's data availability layer. During serialization, each of the block body's sets is serialized as a sequence of pairs, sorted in ascending order on the unique key of each element.

However, only the header hash and header are stored on Cardano L1. This is sufficient because the header specifies Merkle Patricia Trie (MPT) root hashes for each of the sets in the block body. Each of these root hashes can be verified onchain by streaming over the corresponding set's elements, hashing them, and iteratively calculating the root hash.

.. figure:: ../images/block-tx-mpt.svg
   :alt: MPT representation of block transactions
   :align: center

   A Merkle Patricia Trie example for a block's transactions. Each (TxId, SundialTx) pair is hashed to a leaf, which is combined pairwise into intermediate nodes and eventually into the transactions_root hash.

Block header
------------

A block header is a record with fixed-size fields: integers, hashes, and fixed-size bytestrings. A block header hash is 28 bytes in size and calculated via the Blake2b-224 hash:

.. math::

   \begin{split}
   \texttt{HeaderHash} &:= \mathcal{H}_{\texttt{Blake2b-224}}(\texttt{Header}) \\
   \texttt{Header} &:= \left\{ \begin{array}{ll}
       \texttt{prev\_utxos\_root} : & \texttt{RootHash} \\
       \texttt{utxos\_root} : & \texttt{RootHash} \\
       \texttt{transactions\_root} : & \texttt{RootHash} \\
       \texttt{deposits\_root} : & \texttt{RootHash} \\
       \texttt{withdrawals\_root} : & \texttt{RootHash} \\
       \texttt{start\_time} : & \texttt{PosixTime} \\
       \texttt{end\_time} : & \texttt{PosixTime} \\
       \texttt{prev\_header\_hash} : & \texttt{HeaderHash} \\
       \texttt{operator\_vkey} : & \texttt{VerificationKey} \\
       \texttt{protocol\_version} : & \texttt{Int} \\
   \end{array} \right\}
   \end{split}

These header fields are interpreted as follows:

- The ``*_root`` fields are the MPT root hashes of the corresponding sets in the block body.
- The ``prev_utxos_root`` is a copy of the ``utxos_root`` from the previous block, included for convenience in the fraud proof verification procedures.
- The ``start_time`` and ``end_time`` fields are the block's event interval bounds (see :ref:`time-model`).
- The ``prev_header_hash`` is the hash of the previous block header. For the genesis block, this field is set to 28 ``0x00`` bytes.
- The ``operator_vkey`` is the cryptographic verification key for the operator who committed the block header to the L1 state queue.
- The ``protocol_version`` is the Sundial protocol version that applies to this block.