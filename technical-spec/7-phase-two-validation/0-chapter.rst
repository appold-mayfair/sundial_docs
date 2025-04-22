.. _h:phase-two-validation:

Phase Two Validation
====================

Phase two validation represents the critical stage in Midgard’s
transaction processing where UPLC script evaluation occurs.

.. _sec:phase-two-overview:

Overview
--------

Phase two validation serves several key purposes:

-  Validates the execution of UPLC scripts attached to transactions

-  Ensures computational bounds are respected

-  Maintains verifiable execution traces for fraud proof construction

-  Enables efficient dispute resolution through progressive state
   hashing

The validation process consists of three main components:

#. State representation and management

#. Off-chain script decoding and preparation

#. Execution validation and fraud proof mechanisms

Each component is designed to maintain verifiability while optimizing
for L2 performance constraints. The following sections detail these
components and their interactions within the Midgard protocol.

.. _sec:validation-requirements:

Validation Requirements
~~~~~~~~~~~~~~~~~~~~~~~

For a transaction to pass phase two validation:

-  All scripts must be successfully decoded from their byte
   representation

-  Script execution must complete within specified resource bounds

-  All state transitions must be cryptographically verifiable

-  Execution traces must enable efficient fraud proof construction
