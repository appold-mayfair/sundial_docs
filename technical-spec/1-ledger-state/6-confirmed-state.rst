.. _h:confirmed-state:

Confirmed state
===============

When a Midgard block becomes confirmed, a selection of its block header
fields is split into two groups (discarding the rest). These groups are
used to populate the fields of two record types in Midgard’s confirmed
state:

.. math::

   \begin{aligned}
       \T{ConfirmedState} &\coloneq \left\{
       \begin{array}{ll}
           \T{header\_hash} : & \T{HeaderHash} \\
           \T{prev\_header\_hash} : & \T{HeaderHash} \\
           \T{utxo\_root} : & \T{MPTR} \\
           \T{start\_time} : & \T{PosixTime} \\
           \T{end\_time} : & \T{PosixTime} \\
           \T{protocol\_version} : & \T{Int} \\
       \end{array} \right\} \\
       \T{Settlement} &\coloneq \left\{
       \begin{array}{ll}
           \T{deposit\_root} : & \T{MPTR} \\
           \T{withdraw\_root} : & \T{MPTR} \\
           \T{start\_time}: & \T{PosixTime} \\
           \T{end\_time}: & \T{PosixTime} \\
           \T{resolution\_claim}: & \T{Option}(\T{ResolutionClaim})
       \end{array} \right\} \\
       \T{ResolutionClaim} &\coloneq \left\{
       \begin{array}{ll}
           \T{time}: & \T{PosixTime} \\
           \T{operator}: & \T{VerificationKey}
       \end{array}
       \right\}\end{aligned}

At genesis, is set as follows:

.. math::

   \T{genesisConfirmedState} \coloneq \left\{
           \begin{array}{ll}
               \T{header\_hash} \coloneq & 0 \\
               \T{prev\_header\_hash} \coloneq & 0 \\
               \T{utxo\_root} \coloneq & \T{MPTR}_\T{empty} \\
               \T{start\_time} \coloneq & \T{system\_start} \\
               \T{end\_time} \coloneq & \T{system\_start} \\
               \T{protocol\_version} \coloneq & 0
           \end{array} \right\}

Midgard only stores the latest confirmed block’s on L1, always
overwriting the previous one. By contrast, its never overwrites that of
the previous block. Instead, the spins into a separate settlement node
that users and operators can reference to process deposits and
withdrawal requests.

The current operator can optimistically attach a resolution claim to any
settlement node, indicating that all deposits and withdrawals in the
node have been processed and that the node will be removed from the
settlement queue at a given resolution time. The resolution time is set
to the claim’s attachment time, shifted forward by Midgard’s protocol
parameter, in order to provide an opportunity fraud proofs to be
verified on L1 that disprove the operator’s claim that the settlement
node is resolved. The operator is slashed if their claim is disproved;
otherwise, starting from the resolution time, the operator can remove
the settlement node and recover its min-ADA and some fees for processing
the deposits/withdrawals.
