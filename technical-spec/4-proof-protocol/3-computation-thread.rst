.. _h:fraud-proof-computation-threads:

Fraud proof computation threads
===============================

A computation thread splits up a large computation into a series of
steps, passing control between the steps in the continuation-passing
style (CPS). In other words, the computation thread is a state machine
(see
`[h:single-threaded-state-machine] <#h:single-threaded-state-machine>`__)
with a linear state graph.

Each step is a spending validator that executes the following sequence:

#. Parses the computation state from its datum.

#. Optionally receives arguments from its redeemer to guide the
   computation step.

#. Advances the computation by the step, producing a new computation
   state.

#. Suspends the computation by serializing the new computation state
   into a new datum that it sends to the spending validator of the next
   step.

All steps in a computation thread parametrize the same datum type:

.. math::

   \T{StepDatum} (\T{state\_data}) \coloneq \left\{
       \begin{array}{ll}
           \T{fraud\_prover}  : & \T{PubKeyHash} \\
           \T{data} : & \T{state\_data}
       \end{array} \right\}

.. _h:fraud-proof-computation-threads-minting-policy:

Minting policy
--------------

The minting policy initializes its state machine. It is statically
parametrized on the and minting policies. Redeemers:

Init.
   Conditions:

   #. The transaction must reference a node of the . Let that node be .

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let be the policy ID in the corresponding field of the Midgard hub
      oracle.

   #. The transaction must reference a node from the . Let be that node.

   #. The transaction must mint a single token of the minting policy.
      The token name must concatenate the four-byte key of and the
      28-byte block header hash in the key of .

   #. The computation thread token must be sent to the spending
      validator defined in the field of . Let be that transaction
      output.

   #. The datum type must be . [1]_

   #. The transaction must be signed by the pub-key hash of .

   #. Other than ADA, must *not* hold any other tokens.

   #. The transaction must *not* mint or burn any other tokens.

Success.
   Terminate the state machine normally from the final spending
   validator in the computation. There are no conditions because this
   redeemer relies on the spending validator to burn the token.

Cancel.
   Terminate the state machine exceptionally from any spending validator
   in the computation. There are no conditions because this redeemer
   relies on the spending validator to burn the token.

.. _h:fraud-proof-computation-threads-spending-validators:

Spending validators
-------------------

A fraud-proof computation succeeds if its thread token passes through
all the steps’ spending validator addresses. In that case, the last
step’s spending validator reifies the successful fraud-proof by
requiring a fraud-proof token to be minted. The fraud-proof minting
policy requires the computation thread token to be burned, specifically
via the Success redeemer.

On the other hand, at any step, the person who initiated the computation
thread can cancel the computation instead of advancing it. In that case,
the step’s spending validator requires the computation thread token to
be burned via the Cancel redeemer. Thus, while there is typically only
one path for a computation thread to reach success via the sequential
steps, [2]_ there may be multiple opportunities for the computation to
be canceled along the way.

For each fraud-proof category, each spending validator is custom-written
to express the specific logic of that computation step, and it is
statically parametrized on the next step’s spending validator (if any).
One of the custom conditions of the computation step should verify the
transition between the input state and output state of the thread:

.. math::

   \begin{aligned}
       \T{verify\_transition} &: (\T{Input}, \T{Output}, ..\T{Args}) -> \T{Bool} \\
       \T{verify\_transition(i, o, ..args)} &\coloneq
           \Bigl( \T{transition(i, ..args) \equiv \T{o}} \Bigr) \\
       \T{transition} &: (\T{Input}, ..\T{Args}) -> \T{Output}\end{aligned}

All of the spending validators share the same parametric redeemer type,
but each spending validator can parametrize the Continue redeemer by a
different type to hold the custom instructions needed to guide the
computation step:

.. math::

   \T{StepRedeemer} (\T{instructions}) \coloneq
           \T{Continue}(\T{instructions}) \;|\;
           \T{Cancel}

These redeemers should be handled in the following general pattern:

Continue.
   Advance the computation. Conditions:

   #. If this is the last step of the computation:

      -  Mint the fraud token, which will implicitly burn the
         computation thread token with the Success redeemer. Let be that
         transaction output.

      -  The datum type must be .

      -  The field must match between the and the input datum.

   #. Otherwise:

      -  The computation thread token must be sent to the next step’s
         spending validator. Let be that transaction output.

      -  The field must match between the and the input datum.

   #. Evaluate the custom conditions of the computation step, including
      verifying the state transition.

   #. The custom conditions may require the transaction to reference a
      state queue with a key hash matching the last 28 bytes of the
      computation thread token name.

   #. The transaction must *not* mint or burn any other tokens.

Cancel.
   Cancel the computation. Conditions:

   #. Burn the computation thread token with the Cancel redeemer.

   #. Return the ADA from the computation thread utxo to the fraud
      prover pub-key defined in the input datum.

   #. The transaction must *not* mint or burn any other tokens.

.. [1]
   Aiken calls it StepDatum(Void), while Plutarch calls it
   StepDatum(PUnit).

.. [2]
   Technically, if there are multiple instances of the same fraud
   category in a fraudulent block, then there is a corresponding number
   of paths to prove the occurrence of that fraud category in the block.
   The redeemer arguments provided to the computation steps collectively
   select one of these paths.
