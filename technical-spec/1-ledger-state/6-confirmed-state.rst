Confirmed state
===============

When a Midgard block becomes confirmed, a selection of its block header
fields is split into two groups (discarding the rest). These groups are
used to populate the fields of two record types in Midgard’s confirmed
state:

.. math::

   \begin{aligned}
   \texttt{ConfirmedState} &:= \left\{
       \begin{array}{ll}
           \texttt{header_hash} : & \texttt{HeaderHash} \\
           \texttt{prev_header_hash} : & \texttt{HeaderHash} \\
           \texttt{utxo_root} : & \texttt{MPTR} \\
           \texttt{start_time} : & \texttt{PosixTime} \\
           \texttt{end_time} : & \texttt{PosixTime} \\
           \texttt{protocol_version} : & \texttt{Int}
       \end{array} \right\} \\
   \texttt{Settlement} &:= \left\{
       \begin{array}{ll}
           \texttt{deposit_root} : & \texttt{MPTR} \\
           \texttt{withdraw_root} : & \texttt{MPTR} \\
           \texttt{start_time} : & \texttt{PosixTime} \\
           \texttt{end_time} : & \texttt{PosixTime} \\
           \texttt{resolution_claim} : & \texttt{Option(ResolutionClaim)}
       \end{array} \right\} \\
   \texttt{ResolutionClaim} &:= \left\{
       \begin{array}{ll}
           \texttt{time} : & \texttt{PosixTime} \\
           \texttt{operator} : & \texttt{VerificationKey}
       \end{array} \right\}
   \end{aligned}

At genesis, the confirmed state is set as follows:

.. math::

   \texttt{genesisConfirmedState} := \left\{
       \begin{array}{ll}
           \texttt{header_hash} := & 0 \\
           \texttt{prev_header_hash} := & 0 \\
           \texttt{utxo_root} := & \texttt{MPTR}_{\texttt{empty}} \\
           \texttt{start_time} := & \texttt{system_start} \\
           \texttt{end_time} := & \texttt{system_start} \\
           \texttt{protocol_version} := & 0
       \end{array} \right\}

Midgard only stores the latest confirmed block’s state on L1, always
overwriting the previous one. By contrast, its settlement data never
overwrites that of the previous block. Instead, the state is spun into
a separate settlement node that users and operators can reference to
process deposits and withdrawal requests.

The current operator can optimistically attach a resolution claim to any
settlement node, indicating that all deposits and withdrawals in the
node have been processed and that the node will be removed from the
settlement queue at a given resolution time. The resolution time is set
to the claim’s attachment time, shifted forward by Midgard’s protocol
parameter, in order to provide an opportunity for fraud proofs to be
verified on L1 that disprove the operator’s claim that the settlement
node is resolved. The operator is slashed if their claim is disproved;
otherwise, starting from the resolution time, the operator can remove
the settlement node and recover its min-ADA and some fees for processing
the deposits/withdrawals.