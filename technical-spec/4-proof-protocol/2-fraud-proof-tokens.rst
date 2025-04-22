Fraud proof tokens
==================

Fraud proof tokens represent fraud proof computations that have
successfully concluded.

Minting policy
--------------

The minting policy is statically parametrized on the and minting
policies. Redeemers:

Mint.
   Mint a new fraud proof token whenever a fraud proof computation
   succeeds. Conditions:

   #. The transaction must burn a token.

   #. The transaction must mint a token with the same token name as the
      token.

   #. The transaction must include the Midgard hub oracle NFT in a
      reference input.

   #. Let be the policy ID in the corresponding field of the Midgard hub
      oracle.

   #. The token must be sent to the spending validator.

Spending validator
------------------

The spending validator of does *not* allow its utxo to be spent. Midgard
fraud proofs last forever.
