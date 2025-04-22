.. _h:block:

Block
=====

A block consists of a header hash, a header, and a block body:

.. math::

   \T{Block} \coloneq \left\{
       \begin{array}{ll}
           \T{header\_hash} : & \T{HeaderHash} \\
           \T{header} : & \T{Header} \\
           \T{block\_body} : & \T{BlockBody}
       \end{array} \right\}

The block body contains the block’s transactions, deposits, and
withdrawals, along with the unspent outputs that result from applying
the block’s transition to the previous block’s unspent outputs.

.. math::

   \T{BlockBody} \coloneq \left\{
       \begin{array}{ll}
           \T{utxos} : & \T{UtxoSet} \\
           \T{transactions} : & \T{TxSet} \\
           \T{deposits} : & \T{DepositSet} \\
           \T{withdrawals} : & \T{WithdrawalSet} \\
       \end{array} \right\}

shows how the block’s are derived from the previous block’s by applying
the block’s events. Withdrawals are applied before transactions, which
are applied before deposits.

The block is what gets serialized and stored on Midgard’s data
availability layer. During serialization, each of the block body’s sets
is serialized as a sequence of pairs, sorted in ascending order on the
unique key of each element.

However, only the header hash and header are stored on Cardano L1. This
is sufficient because the header specifies Merkle Patricia Trie (MPT)
root hashes for each of the sets in the block body. Each of these root
hashes can be verified onchain by streaming over the corresponding set’s
elements, hashing them, and iteratively calculating the root hash.

shows an example MPT representation of a block’s transactions. The
:math:`(\T{TxId_i}, \T{MidgardTx_i})` pairs are the data blocks of the
tree, which are individually hashed to form the leaves :math:`L_i` of
the tree. The hashes of sibling leaves are concatenated and hashed to
form their parent nodes. The nodes :math:`N_{ij}` are formed by
concatenating and hashing their children’s hashes. The is formed by
concatenating and hashing its children’s hashes.

.. _h:block-header:

Block header
------------

A block header is a record with fixed-size fields: integers, hashes, and
fixed-size bytestrings. A block header hash is 28 bytes in size and
calculated via the Blake2b-224.

.. math::

   \begin{split}
     \T{HeaderHash} &\coloneq \mathcal{H}_\T{Blake2b-224}(\T{Header}) \\
     \T{Header} &\coloneq \left\{
       \begin{array}{ll}
           \T{prev\_utxos\_root} : & \T{RootHash} \\
           \T{utxos\_root} : & \T{RootHash} \\
           \T{transactions\_root} : & \T{RootHash} \\
           \T{deposits\_root} : & \T{RootHash} \\
           \T{withdrawals\_root} : & \T{RootHash} \\
           \T{start\_time} : & \T{PosixTime} \\
           \T{end\_time} : & \T{PosixTime} \\
           \T{prev\_header\_hash} : & \T{HeaderHash} \\
           \T{operator\_vkey} : & \T{VerificationKey} \\
           \T{protocol\_version} : & \T{Int} \\
       \end{array} \right\}
   \end{split}

These header fields are interpreted as follows:

-  The fields are the MPT root hashes of the corresponding sets in the
   block body.

-  The is a copy of the from the previous block, included for
   convenience in the fraud proof verification procedures.

-  The and fields are the block’s event interval bounds (see
   `[h:time-model] <#h:time-model>`__).

-  The field is a hash of the previous block header. For the genesis
   block, this field is set to 28 bytes.

-  The field is the cryptographic verification key for signatures of the
   operator who committed the block header to the L1 state queue.

-  The is the Midgard protocol version that applies to this block.
