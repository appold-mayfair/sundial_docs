.. _h:single-threaded-state-machine:

Single-threaded state machine
=============================

.. _h:single-threaded-state-machine-utxo-representation:

Utxo representation
-------------------

Each single-threaded state machine’s current state is represented in the
blockchain ledger as a single utxo:

-  The spending validator of the utxo defines the possible transitions
   out of the current state.

-  The utxo value contains a thread token corresponding to the state
   machine.

-  The datum contains the output that the machine emitted upon entering
   the current state.

Each state transition of the state machine is executed via a separate
blockchain transaction:

-  The state machine’s thread token must be unique within the
   transaction context. [1]_

-  The before-state is represented by the transaction input that
   contains the thread token.

-  The after-state is represented by the transaction output that
   contains the thread token.

-  The state transition’s input is represented by the redeemer provided
   to the before-state’s spending validator. If the spending validator
   defines several state transitions, the redeemer selects one for the
   transaction.

.. _h:single-threaded-state-machine-minting-policy:

Minting policy
--------------

The thread token’s minting policy defines the state machine’s initial
states, initialization procedure, final states, and termination
procedure. It also implicitly defines the state machine’s subgraph of
reachable states, as each initial state’s spending validator defines the
transitions out of that state and, inductively, all further transitions
out of the resulting states. Redeemers:

Initialize.
   Mint the thread token and send it to the spending validator address
   of one of the state machine’s initial states. This redeemer receives
   an initial input that selects the initial state and provides
   additional information that can be referenced in subsequent state
   transitions.

   The thread token’s name should indicate the selected initial state
   and include a hash of the reference information provided in the
   initial input. If the state machine is deterministic, its thread
   token name identifies its unique path from initialization to the
   current state.

Finalize.
   Terminate the state machine normally if it is in one of the final
   states. Burn the thread token and (if needed) perform cleanup actions
   that are universally needed when terminating normally from any final
   state.

Cancel.
   Terminate the state machine exceptionally from any state. Burn the
   thread token and (if needed) perform cleanup actions that are
   universally needed when terminating exceptionally from any state.

.. _h:single-threaded-state-machine-spending-validators:

Spending validators
-------------------

If the state machine is non-deterministic, some of its spending
validators define multiple possible transitions out of some states. The
redeemers provided to these spending validators select the state
transitions out of those states. Furthermore, the redeemers may provide
additional arguments so that the spending validators have the context to
decide whether to allow the selected state transitions.

Each spending validator is custom-written to express the specific logic
of the possible transitions out of its state. For each of these
transitions, the spending validator must include a condition that
verifies the transformation of the input state into the corresponding
output state:

.. math::

   \begin{aligned}
       \T{verify\_transition}_{ij} &: (\T{Input}_i, \T{Output}_j, ..\T{Args}_j) -> \T{Bool} \\
       \T{verify\_transition}_{ij}\T{(i, o, ..args)} &\coloneq
           \Bigl( \T{transition}_{ij}\T{(i, ..args) \equiv \T{o}} \Bigr) \\
       \T{transition}_{ij} &: (\T{Input}_i, ..\T{Args}_j) -> \T{Output}_j\end{aligned}

.. _h:single-threaded-state-machine-compilation:

Compilation
-----------

Each spending validator can be either statically or dynamically
parametrized on the spending validators into which its outbound state
transitions lead.

-  Static parametrization is preferred for state transitions that are
   expected to occur more frequently in typical executions of the state
   machine. A fancy way of expressing this is that state transitions
   should be statically parametrized along the maximally weighted
   acyclic subgraph of the state graph.

-  Dynamic parametrization should be used for all other state
   transitions because statically parametrizing them would cause
   circular compilation dependencies on more preferred state
   transitions.

Dynamic parametrization means that the spending validator requires a
reference input that indicates the addresses of the spending validators
on which it dynamically depends. This reference input is crucial for the
integrity of the state machine’s state graph, so secure governance
mechanisms should control its creation/modification.

.. _h:single-threaded-state-machine-example:

Example
-------

Consider a simplified model of the git pull-request (PR) workflow, with
the following states:

Draft (initial state).
   The drafter is implementing a feature or bug fix in a repository
   branch. Transitions:

   Update.
      The drafter updates the branch by adding some git commits. Next
      state: Draft.

   Request review.
      The drafter requests a review for the branch. Next state: Testing.

Testing.
   The test suite is executing. Transitions:

   Fail.
      The branch fails its test suite. Next state: Draft.

   Pass.
      The branch passes its test suite. Next state: Review.

Review.
   The reviewer is deciding whether the branch should merge into the
   main branch. Transitions:

   Approve.
      The reviewer approves the branch to be merged into the
      repository’s main branch. Next state: Merged.

   Changes.
      The reviewer requests some changes to the branch. Next state:
      Changes requested.

Changes requested.
   The drafter is considering the reviewer’s feedback. Transitions:

   Respond.
      The drafter responds to the reviewer, arguing that changes are not
      required. Next state: Review.

   Accept.
      The drafter accepts the reviewer’s change requests. Next state:
      Draft.

Approved (final state).
   The branch is merged into the main branch. Transitions:

   Merge.
      The state machine terminates normally from the final state. The
      branch is merged into the main branch and then deleted.

The onchain state machine representation of the above git PR model uses
one minting policy and five spending validators. The minting policy:

-  Defines Draft as the initial state.

-  Assigns the state machine a token name corresponding to the commit
   hash of the base branch of the PR. [2]_

-  Defines Merged as the final state.

-  Updates the state of the main branch when the PR branch is merged.

The spending validators define the transitions out of their
corresponding states. The state datum types include the PR’s current
commit hash and other information relevant to their outbound
transitions. For example, the spending validator for the Draft state has
redeemers to validate two state transitions:

Update.
   Go to the Draft state. Update the PR commit hash and resolve any
   accepted change requests that the update addresses.

Request review.
   Go to the Testing state. Ensure that no accepted change requests
   remain.

We can also add a Cancel redeemer to every spending validator and the
minting policy. In the git PR workflow, this state transition would
reflect the fact that a PR can be closed at any time. Some additional
logic may be needed in each of these redeemers to properly dispose of
the PR after it is closed.

.. [1]
   This avoids double-satisfaction issues during onchain validation of
   state transitions, as any transition’s before and after states can be
   uniquely identified in any transaction. However, the state machine’s
   thread token does *not* need to be globally unique across the
   blockchain ledger — it may be desirable to run several machines
   simultaneously, evolving their states in independent transaction
   chains.

.. [2]
   In this simplified model, the base branch cannot be changed for a PR.
