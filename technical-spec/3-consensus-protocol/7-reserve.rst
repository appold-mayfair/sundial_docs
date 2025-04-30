Reserve
=======

When Sundial confirms deposit events, their funds are either transferred
into Sundial’s reserve or used directly to pay out confirmed
withdrawals. Even when deposits are directly used to pay out
withdrawals, any leftover funds from the deposits are transferred into
Sundial’s reserve.

Sundial’s reserve smart contract is responsible for safeguarding these
funds, ensuring that they can only be used to pay out confirmed
withdrawals. It also allows the current operator to rearrange the funds
within the Reserve spending validator into utxos that are more optimized
to process withdrawals of varying sizes with minimal contention.
