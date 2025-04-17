Block
=====

A block consists of a header hash, a header, and a block body:

- `Block`:
  - `header_hash`: `HeaderHash`
  - `header`: `Header`
  - `block_body`: `BlockBody`

The block body contains:

- `utxos`: `UtxoSet`  
- `transactions`: `TxSet`  
- `deposits`: `DepositSet`  
- `withdrawals`: `WithdrawalSet`

These represent the unspent outputs resulting from applying the block's transition to the previous block’s UTXO set.

Withdrawals are applied **before** transactions, and transactions are applied **before** deposits during the block transition process.

---

### Block Storage

- The full block is **serialized and stored** on Midgard’s data availability layer.
- The **Cardano L1** only stores the `header_hash` and `header`.

The header contains Merkle Patricia Trie (MPT) root hashes for each set in the block body. These hashes can be verified on-chain by streaming the set’s elements and recalculating the root hash.

---

### Merkle Patricia Trie (MPT) Example

Each transaction is represented as a pair `(TxId, MidgardTx)` that is hashed into leaf nodes. These leaf hashes are recursively combined to form internal nodes, ending in the `transactions_root`.

**transactions_root** = `H(N₁₂ || N₃₄)`

Where:

- `N₁₂ = H(L₁ || L₂)`  
- `L₁ = H(D₁)`, with `D₁ = (TxId₁, MidgardTx₁)`  
- `L₂ = H(D₂)`  
- ... and so on

(The actual diagram is omitted here; you can embed the SVG/PDF version as an image in Sphinx if you want it visually.)

---

Block Header
------------

A block header is a record with **fixed-size fields**, including hashes, timestamps, and cryptographic keys.

```text
HeaderHash = Blake2b-224(Header)

Header = {
  prev_utxos_root:      RootHash,
  utxos_root:           RootHash,
  transactions_root:    RootHash,
  deposits_root:        RootHash,
  withdrawals_root:     RootHash,
  start_time:           PosixTime,
  end_time:             PosixTime,
  prev_header_hash:     HeaderHash,
  operator_vkey:        VerificationKey,
  protocol_version:     Int
}
