Offchain data architecture
==========================

Sundial operators only commit block headers to the L1 state queue. They
store their actual blocks temporarily in Sundial’s data availability
layer for at least the maturity period, and then permanently on
Sundial’s archive nodes.
