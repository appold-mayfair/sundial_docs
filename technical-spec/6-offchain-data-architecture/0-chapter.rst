.. _h:offchain-data-architecture:

Offchain data architecture
==========================

Midgard operators only commit block headers to the L1 state queue. They
store their actual blocks temporarily in Midgard’s data availability
layer for at least the maturity period, and then permanently on
Midgard’s archive nodes.
