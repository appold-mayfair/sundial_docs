.. _s:phase-two-decoding-off-chain:

Off-chain Decoding
==================

This section details the process of decoding UPLC script bytes into
executable Terms during phase two validation.

Byte Format Specification
-------------------------

UPLC scripts are serialized using the flat format, which provides a
compact binary representation optimized for blockchain storage. The
format consists of:

-  Version number (major.minor.patch) encoded as three natural numbers

-  Term structure encoded as tagged bit sequences

-  Constants encoded based on their type (integers, bytestrings, etc.)

-  Built-in functions encoded as 7-bit tags

-  De Bruijn indices for variable references

-  Padding bits to ensure byte alignment

Decoding Process
----------------

The decoding process follows these key steps:

#. Read and validate the version number

#. Parse the term structure by interpreting tag bits:

   -  0011 - Application

   -  0100 - Constants

   -  0111 - Built-in functions

   -  etc.

#. Decode constants according to their type tags

#. Resolve built-in function references via their 7-bit tags

#. Construct the final term tree

Term Construction Process
-------------------------

The decoder maintains state during term construction:

.. math::

   \text{BytesToTermStep} \coloneq \left\{
       \begin{array}{ll}
           \text{step\_type} : & \text{DecodingStepType} \\
           \text{input\_bytes} : & \text{ScriptBytes} \\
           \text{remaining\_bytes} : & \text{ScriptBytes} \\
           \text{partial\_term} : & \text{Term} \\
           \text{transformation\_proof} : & \text{Hash}
       \end{array} \right\}

Decoding Step Types
-------------------

The represents the specific transformation being performed:

.. math::

   \text{DecodingStepType} \coloneq \left\{
       \begin{array}{ll}
           \text{VersionDecode} : & \text{(major, minor, patch)} \\
           \text{TermTagDecode} : & \text{TagBits} \\
           \text{TypeTagDecode} : & \text{[TypeTag]} \\
           \text{ConstantDecode} : & \text{Type} \times \text{Value} \\
           \text{BuiltinDecode} : & \text{BuiltinTag} \\
           \text{PaddingValidate} : & \text{PaddingBits}
       \end{array} \right\}

Transformation Proofs
---------------------

Each step’s must demonstrate:

-  Valid consumption of input bytes according to the format
   specification

-  Correct interpretation of decoded values

-  Proper handling of any padding or alignment requirements

-  Maintenance of the well-formed term structure

For example, a proof must show:

-  The type tag list was properly terminated

-  The constant value matches its declared type

-  Any required padding was correctly handled

-  The remaining bytes are properly aligned

Validation Chain
----------------

The complete decoding process produces a sequence of s that can be
independently verified. This enables:

-  Detection of malformed script bytes

-  Identification of specific decoding failures

-  Construction of fraud proofs for invalid transformations

-  Verification of the complete decoding process

Transformation Types
--------------------

Different term types require specific decoding transformations:

-  Constants - Decoded based on type tags and specific encoding rules

-  Applications - Recursively decode function and argument terms

-  Built-ins - Lookup via 7-bit tag table

-  Variables - Convert de Bruijn indices to term references

Validation Requirements
-----------------------

The decoder must enforce several validation rules:

-  Version compatibility check

-  Well-formed term structure

-  Valid constant values

-  Recognized built-in functions

-  Proper scope for de Bruijn indices

-  Complete byte consumption (no trailing data)
