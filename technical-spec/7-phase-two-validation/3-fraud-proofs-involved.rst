.. _s:phase-two-fraud-proofs:

Fraud Proofs in UPLC Evaluation
===============================

This section details the fraud proofs involved in UPLC evaluation,
focusing on single-step verification of state transitions.

Types of Fraud Proofs
---------------------

The system supports these categories of fraud proofs:

Decoding Fraud
   Proofs of invalid script byte decoding:

   -  Invalid byte format

   -  Size limit violations

   -  Reference resolution failures

Execution Fraud
   Proofs of invalid UPLC execution:

   -  Resource limit violations

   -  Invalid state transitions

   -  Incorrect execution results

Single-Step Verification
------------------------

The fraud proof system verifies individual state transitions:

.. math::

   \begin{split}
       \forall s_1, s_2 \in \text{CEKState}: & \text{ claimed\_transition}(s_1 \rightarrow s_2) \text{ valid } \iff \\
       & \text{compute\_next\_state}(s_1) = s_2
   \end{split}

To prove a violation:

-  The operator provides the claimed before state (:math:`s_1`) and
   after state (:math:`s_2`)

-  The challenger computes the actual next state from :math:`s_1`

-  If the computed state differs from :math:`s_2`, the transition is
   invalid

-  No additional trace information is required

Proof Data Structure
--------------------

The fraud proof structure is minimal:

.. math::

   \text{FraudProof} \coloneq \left\{
       \begin{array}{ll}
           \text{step\_number} : & \mathbb{N} \\
           \text{before\_state} : & \text{CEKState} \\
           \text{claimed\_after\_state} : & \text{CEKState} \\
           \text{actual\_after\_state} : & \text{CEKState}
       \end{array} \right\}

Verification Process
--------------------

The verification process is straightforward:

#. Verify the before state matches the operator’s claim

#. Compute one step from the before state

#. Compare computed result with operator’s claimed after state

#. If they differ, the fraud proof is valid

Security Considerations
-----------------------

The single-step verification approach provides several benefits:

-  Minimal proof size

-  Constant-time verification

-  No complex challenge periods needed

-  Deterministic outcomes

Security guarantees include:

-  No false positives (valid transitions cannot be proven invalid)

-  No trace reconstruction required

-  Immediate verification of claims

-  Protection against computational waste attacks
