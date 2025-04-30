State Representation
====================

This section describes how the state is represented during phase two
validation, including the data structures and encoding methods used for
UPLC evaluation.

Term Representation
-------------------

The UPLC Term representation uses progressive hashing to maintain
compact state while preserving verifiability:

.. math::

   \begin{aligned}
       \text{Term} :=&\;
           \text{Variable} (\text{Name}) \\\mid&\;
           \text{Lambda} (\text{Name}, \text{Hash}) \\\mid&\;
           \text{Apply} (\text{Hash}, \text{Hash}) \\\mid&\;
           \text{Constant} (\text{Hash}) \\\mid&\;
           \text{Force} (\text{Hash}) \\\mid&\;
           \text{Delay} (\text{Hash}) \\\mid&\;
           \text{Builtin} (\text{BuiltinFunction})\end{aligned}

Each in the Term representation refers to another Term that has been
previously processed and hashed. This creates a directed acyclic graph
(DAG) of Term components where larger structures are decomposed into
their constituent parts.

For example, a lambda expression like :math:`\lambda x.\lambda y.[y x]`
would be represented as:

-  A Lambda node containing :math:`(x, h_1)`

-  Where :math:`h_1` is the hash of a Lambda node containing
   :math:`(y, h_2)`

-  Where :math:`h_2` is the hash of an Apply node containing
   :math:`(h_3, h_4)`

-  Where :math:`h_3` is the hash of a Variable node containing :math:`y`

-  Where :math:`h_4` is the hash of a Variable node containing :math:`x`

Decoding Steps
--------------

The conversion from flat-encoded script bytes to the final Term follows
a sequence of BytesToTermSteps:

.. math::

   \text{BytesToTermStep} := \left\{
       \begin{array}{ll}
           \text{remaining\_bytes} : & \text{ScriptBytes} \\
           \text{partial\_term} : & \text{Term}
       \end{array} \right\}

Each step represents an atomic transformation in the decoding process,
with the enabling independent verification of that specific step.

Execution Steps
---------------

The execution state during UPLC evaluation is represented by the CEK
machine state:

.. math::

   \text{CEKState} := \left\{
       \begin{array}{ll}
           \text{term\_hash} : & \text{Hash} \\
           \text{env} : & \text{Environment} \\
           \text{continuation} : & \text{Continuation}
       \end{array} \right\}

Each execution step produces a new CEK state and tracks execution units
consumed:

.. math::

   \text{ExecutionStep} := \left\{
       \begin{array}{ll}
           \text{before\_state} : & \text{CEKState} \\
           \text{after\_state} : & \text{CEKState} \\
           \text{execution\_units} : & \text{ExecutionUnits}
       \end{array} \right\}

Execution Trace
---------------

The complete execution trace combines the bytes-to-term conversion and
CEK machine evaluation. In the following, we use the notation
:math:`\mathcal{RH}` to indicate a root hash of a Merkle-Patricia tree.

.. math::

   \text{ExecutionTrace} := \left\{
       \begin{array}{ll}
           \text{bytes\_to\_term\_steps} : & \mathcal{RH}(\text{[BytesToTermStep]}) \\
           \text{initial\_state} : & \text{CEKState} \\
           \text{steps} : & \mathcal{RH}(\text{[ExecutionStep]})
       \end{array} \right\}

The execution trace is stored in transaction witness sets:

.. math::

   \text{SundialTxWits} \coloneq \left\{
       \begin{array}{ll}
           ... \\
           \text{execution\_traces} : & \quad?\;\mathcal{RH}(\text{Map(RdmrPtr, ExecutionTrace)})
       \end{array} \right\}

This representation allows any step of the trace to be independently
verified without requiring access to the complete execution history,
enabling efficient fraud proof construction and validation.
