Escape hatch
============

An escape hatch block can be added to the state queue as follows:

#. Spend transaction order and withdrawal order utxos, refunding all of
   their min-ADA.

#. Reference compliance proof tokens verifying that the spent orders
   fully comply with Midgard’s ledger rules.

#. Append a node to the state queue with a special EscapeHatch datum.

If the escape hatch block is removed (because it is a child of a
fraudulent block), its transaction and withdrawal orders are lost.
However, they can be recreated, and their compliance proofs can be
reused to create another escape hatch block (omitting any orders that
are no longer valid).

An escape hatch block is merged into the confirmed state like an
operator block: copy over the relevant fields to the ConfirmedHeader and
append a node to the settlement queue if the escape hatch block contains
any withdrawal events.
