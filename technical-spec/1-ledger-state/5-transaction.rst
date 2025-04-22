.. _h:transaction:

Transaction
===========

A transaction set in Midgard is a finite map from transaction ID to
Midgard L2 transaction, where the ID is also constrained to be the
Blake2b-256 hash of the transaction:

.. math::

   \begin{aligned}
       \T{TxSet} &\coloneq \T{Map(TxId, MidgardTx)} \\
         &\coloneq \Bigl\{
           (k_i: \T{TxId}, v_i: \T{MidgardTx}) \mid 
           k_i \equiv \mathcal{H}_\T{Blake2b-256}(v_i) ,\;
           \forall i \neq j.\; k_i \neq k_j
       \Bigr\}\end{aligned}

An L2 transaction in a Midgard block is an endogenous event. Its
corresponding utxo set transition is validated purely based on the
information contained in the utxo set. This contrasts with deposit and
withdrawal events, which create and spend utxos (respectively) based on
information observed outside the L2 ledger.

A transaction can only spend a utxo if it satisfies the conditions of
the spending validator corresponding to the utxo’s payment address, and
it can only mint and burn tokens by satisfying the conditions of the
corresponding minting policies. Of course, users can inject information
into the utxo set via redeemer arguments and output datums set in
transactions, but those are still subject to the transaction scripts’
conditions.

.. _h:cardano-transaction-types:

Cardano transaction types
-------------------------

Cardano’s L1 transaction type (`Chang 2
hardfork <https://github.com/IntersectMBO/cardano-ledger/blob/cardano-ledger-conway-1.17.2.0/eras/conway/impl/src/Cardano/Ledger/Conway/Tx.hs>`__)
served as an initial model for Midgard’s L2 transaction type. In the
following, field types prefixed by a question mark are set to
appropriate “empty” defaults during deserialization if the serialized
transaction omits them: [1]_  [2]_

.. math::

   \begin{aligned}
       \T{CardanoTx} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{body} : & \T{CardanoTxBody} \\
           \T{wits} : & \T{CardanoTxWits} \\
           \T{is\_valid} : & \T{Bool} \\
           \T{auxiliary\_data} : & \quad?\;\T{TxMetadata}
       \end{array} \right\} \\
       \T{CardanoTxBody} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{spend\_inputs} : & \T{Set(OutputRef)} \\
           \T{collateral\_inputs} : & \quad?\;\T{Set(OutputRef)} \\
           \T{reference\_inputs} : & \quad?\;\T{Set(OutputRef)} \\
           \T{outputs} : & \T{[Output]} \\
           \T{collateral\_return} : & \quad?\;\T{Output} \\
           \T{total\_collateral} : & \quad?\;\T{Coin} \\
           \T{certificates} : & \quad?\;\T{[ Set(Certificate) ]} \\
           \T{withdrawals} : & \quad?\;\T{Map(RewardAccount, Coin)} \\
           \T{fee} : & \T{Coin} \\
           \T{validity\_interval} : & \T{CardanoValidityInterval} \\
           \T{required\_signer\_hashes} : & \quad?\;\T{Set(VKeyHash)} \\
           \T{mint} : & \quad?\;\T{Value} \\
           \T{script\_integrity\_hash} : & \quad?\;\T{Hash} \\
           \T{auxiliary\_data\_hash} : & \quad?\;\T{Hash} \\
           \T{network\_id} : & \quad?\;\T{Network} \\
           \T{voting\_procedures} : & \quad?\;\T{VotingProcedures} \\
           \T{proposal\_procedures} : & \quad?\;\T{Set(ProposalProcedure)} \\
           \T{current\_treasury\_value} : & \quad?\;\T{Coin} \\
           \T{treasury\_donation} : & \quad?\;\T{Coin}
       \end{array} \right\}\\
       \T{CardanoTxWits} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{addr\_tx\_wits} : & \quad?\;\T{Set(VKey, Signature, VKeyHash)} \\
           \T{boot\_addr\_tx\_wits} : & \quad?\;\T{Set(BootstrapWitness)} \\
           \T{script\_tx\_wits} : & \quad?\;\T{Map(ScriptHash, CardanoScript)} \\
           \T{data\_tx\_wits} : & \quad?\;\T{TxDats} \\
           \T{redeemer\_tx\_wits} : & \quad?\;\T{Redeemers}
       \end{array} \right\}\\
       \T{CardanoValidityInterval} \coloneq\;& (\T{Option(Slot), Option(Slot)}) \\ 
       \T{CardanoScript} \coloneq\;& \T{TimelockScript}(\T{Timelock}) \\
                             \mid\;& \T{PlutusScript}(\T{CardanoPlutusVersion},\T{PlutusBinary}) \\
       \T{CardanoPlutusVersion} \coloneq\;& \T{PlutusV1} \\
                                    \mid\;& \T{PlutusV2} \\
                                    \mid\;& \T{PlutusV3}\end{aligned}

.. _h:deviations-from-cardano-transaction-types:

Deviations from the Cardano transaction types
---------------------------------------------

Midgard’s transaction types deviate from Cardano’s in the following
ways:

No staking or governance actions.
   Midgard’s consensus protocol is not based on Ouroboros
   proof-of-stake, and its governance protocol is not based on Cardano’s
   hard-fork-combinator update mechanism. Furthermore, Midgard’s L1
   scripts cannot authorize arbitrary staking or governance actions on
   behalf of users. For this reason, staking and governance actions are
   prohibited in Midgard L2 transactions.

No pre-Conway features.
   Midgard does not need to maintain backwards compatibility with
   pre-Conway eras. Midgard deposits and transactions will be prohibited
   from using bootstrap addresses, and Shelley addresses with Plutus
   versions older than Plutus V3. Public key hash credentials, native
   scripts, and Plutus scripts at or above V3 are allowed.

No transaction metadata.
   Midgard prohibits using metadata in L2 transactions but allows users
   to set the to any arbitrary hash, which Midgard’s ledger’s rules do
   not require to match the empty transaction metadata field. This
   preserves users’ ability to pin metadata content via a hash in
   Midgard’s ledger, but they are expected to store the actual metadata
   offchain.

No datum hashes in outputs.
   Midgard requires all utxo datums to be inline, which avoids the need
   to index the datum-hash to datum map from transactions’ datum
   witnesses.

CIPs 112 and 128.
   Midgard has adopted
   `CIP-112 <https://github.com/cardano-foundation/CIPs/tree/master/CIP-0112>`__
   and `CIP
   128 <https://github.com/cardano-foundation/CIPs/tree/master/CIP-0128>`__
   ahead of Cardano mainnet, which we expect to merge them in 2025.
   CIP-112 provides a new “Observe” script purpose, a more principled
   and streamlined alternative to the “Withdraw 0” trick widely used by
   most Cardano dApps. It also allows native scripts to conditionally
   forward their logic to an observer script. On the other hand, CIP-128
   will significantly improve the execution efficiency achievable in
   Plutus contracts by preserving the order of inputs in a submitted
   transaction (instead of ordering them by ).

Different network ID.
   Midgard transactions and utxo addresses use a different network ID to
   distinguish them from their Cardano mainnet counterparts.
   Furthermore, we are considering a prefix to minting policy IDs to
   distinguish tokens deposited from L1 from tokens minted on L2.

Replace slots with POSIX timestamps.
   Midgard’s consensus protocol does not use slots like Ouroboros.
   Furthermore, the L1 contracts that enforce Midgard’s consensus
   protocol are evaluated in the Plutus script context, where slots are
   converted to Posix timestamps. For these reasons, Midgard uses POSIX
   timestamps instead of slots in L2 transactions.

IsValid tag is always True.
   Midgard’s consensus protocol does not use the IsValid tag, so it is
   always set to .

.. _h:midgard-simplified-transaction-types:

Midgard simplified transaction types
------------------------------------

Midgard’s actual transaction types are complicated by the need to
optimize their traversal by Plutus scripts. As an intermediate step
towards them, the following simplified types illustrate how the Cardano
transaction types (`1.1 <#h:cardano-transaction-types>`__) are modified
by Midgard’s deviations
(`1.2 <#h:deviations-from-cardano-transaction-types>`__). We use the
empty set symbol to indicate fields required to be empty in Midgard
transactions and use the star symbol to indicate new or modified fields:

.. math::

   \begin{aligned}
       \T{MidgardSTx} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{body} : & \T{MidgardSTxBody} \\
           \T{wits} : & \T{MidgardSTxWits} \\
           \T{is\_valid} : & \T{Bool} \\
           \varnothing\;\T{auxiliary\_data}: & \quad?\;\T{TxMetadata}
       \end{array} \right\} \\
       \T{MidgardSTxBody} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{spend\_inputs} : & \T{Set(OutputRef)} \\
           \varnothing\;\T{collateral\_inputs} : & \quad?\;\T{Set(OutputRef)} \\
           \T{reference\_inputs} : & \quad?\;\T{Set(OutputRef)} \\
           \T{outputs} : & \T{[Output]} \\
           \varnothing\;\T{collateral\_return} : & \quad?\;\T{Output} \\
           \varnothing\;\T{total\_collateral} : & \quad?\;\T{Coin} \\
           \varnothing\;\T{certificates} : & \quad?\;\T{[ Set(Certificate) ]} \\
           \varnothing\;\T{withdrawals} : & \quad?\;\T{Map(RewardAccount, Coin)} \\
           \T{fee} : & \T{Coin} \\
           \star\;\T{validity\_interval} : & \quad?\;\T{MidgardSValidityInterval} \\
           \star\;\T{required\_observers} : & \quad?\;\T{[ScriptCredential]} \\
           \T{required\_signer\_hashes} : & \quad?\;\T{[VKeyCredential]} \\
           \T{mint} : & \quad?\;\T{Value} \\
           \T{script\_integrity\_hash} : & \quad?\;\T{Hash} \\
           \T{auxiliary\_data\_hash} : & \quad?\;\T{Hash} \\
           \T{network\_id} : & \quad?\;\T{Network} \\
           \varnothing\;\T{voting\_procedures} : & \quad?\;\T{VotingProcedures} \\
           \varnothing\;\T{proposal\_procedures} : & \quad?\;\T{Set(ProposalProcedure)} \\
           \varnothing\;\T{current\_treasury\_value} : & \quad?\;\T{Coin} \\
           \varnothing\;\T{treasury\_donation} : & \quad?\;\T{Coin}
       \end{array} \right\}\\
       \T{MidgardSTxWits} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{addr\_tx\_wits} : & \quad?\;\T{Set(VKey, Signature, VKeyHash)} \\
           \varnothing\;\T{boot\_addr\_tx\_wits} : & \quad?\;\T{Set(BootstrapWitness)} \\
           \T{script\_tx\_wits} : & \quad?\;\T{Map(ScriptHash, MidgardSScript)} \\
           \varnothing\;\T{data\_tx\_wits} : & \quad?\;\T{TxDats} \\
           \T{redeemer\_tx\_wits} : & \quad?\;\T{Redeemers}
       \end{array} \right\}\\
       \T{MidgardSValidityInterval} \coloneq\;& (\T{Option(PosixTime), Option(PosixTime)}) \\ 
       \T{MidgardSScript} \coloneq\;& \T{TimelockScript}(\star\;\T{TimelockObserver}) \\
                             \mid\;& \T{PlutusScript}(\T{MidgardSPlutusVersion},\T{PlutusBinary}) \\
       \T{MidgardSPlutusVersion} \coloneq\;& \T{PlutusV3}\end{aligned}

.. _h:midgard-transaction-types:

Midgard transaction types
-------------------------

Midgard’s transaction types modify the above simplified types by
replacing all variable-length fields with hashes (indicated by the
letter :math:`\mathcal{H}` below). The data availability layer is
responsible for confirming that the hashes correspond to their
preimages, and DA fraud proofs can be submitted if this correspondence
is violated.

.. math::

   \begin{aligned}
       \T{MidgardTx} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{body} : & \mathcal{H}(\T{MidgardTxBody}) \\
           \T{wits} : & \mathcal{H}(\T{MidgardTxWits}) \\
           \T{is\_valid} : & \T{Bool} \\
       \end{array} \right\} \\
       \T{MidgardTxBody} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{spend\_inputs} : & \mathcal{H}(\T{[OutputRef]}) \\
           \T{reference\_inputs} : & \quad?\;\mathcal{H}(\T{[OutputRef]}) \\
           \T{outputs} : & \mathcal{H}(\T{[Output]}) \\
           \T{fee} : & \T{Coin} \\
           \T{validity\_interval} : & \quad?\;\T{MidgardSValidityInterval} \\
           \T{required\_observers} : & \quad?\;\mathcal{H}(\T{[ScriptCredential]}) \\
           \T{required\_signer\_hashes} : & \quad?\;\mathcal{H}(\T{[VKeyCredential]}) \\
           \T{mint} : & \quad?\;\T{Value} \\
           \T{script\_integrity\_hash} : & \quad?\;\T{Hash} \\
           \T{auxiliary\_data\_hash} : & \quad?\;\T{Hash} \\
           \T{network\_id} : & \quad?\;\T{Network}
       \end{array} \right\}\\
       \T{MidgardTxWits} \coloneq\;& \left\{
       \begin{array}{ll}
           \T{addr\_tx\_wits} : & \quad?\;\mathcal{H}(\T{Set(VKey, Signature, VKeyHash)}) \\
           \T{script\_tx\_wits} : & \quad?\;\mathcal{H}(\T{Map(ScriptHash, MidgardSScript)}) \\
           \T{redeemer\_tx\_wits} : & \quad?\;\mathcal{H}(\T{Redeemers})
       \end{array} \right\}\\\end{aligned}

.. [1]
   In this section, we are mainly concerned with comparing Cardano and
   Midgard’s deserialized data types. Serialization formats and
   conversions are addressed in Midgard’s CDDL specifications.

.. [2]
   For simplicity of exposition, we omit the “era” type parameters,
   effectively coercing them all to the Conway era. We also simplify the
   script types.
