import { Data } from "@lucid-evolution/lucid";

export const OutputReferenceSchema = Data.Object({
  txHash: Data.Object({ hash: Data.Bytes({ minLength: 32, maxLength: 32 }) }),
  outputIndex: Data.Integer(),
});
export type OutputReference = Data.Static<typeof OutputReferenceSchema>;
export const OutputReference =
  OutputReferenceSchema as unknown as OutputReference;

export const AssetsSchema = Data.Object({
  policyId: Data.Bytes(),
  assetName: Data.Bytes(),
});
export type Assets = Data.Static<typeof AssetsSchema>;
export const Assets = AssetsSchema as unknown as Assets;

export const ValueSchema = Data.Object({
  inner: Data.Map(Data.Bytes(), Data.Map(Data.Bytes(), Data.Integer())),
});
export type Value = Data.Static<typeof ValueSchema>;
export const Value = ValueSchema as unknown as Value;

export const POSIXTimeSchema = Data.Integer();
export type POSIXTime = Data.Static<typeof POSIXTimeSchema>;
export const POSIXTime = POSIXTimeSchema as unknown as POSIXTime;

export const PubKeyHashSchema = Data.Bytes({ minLength: 28, maxLength: 28 });

export const PolicyIdSchema = Data.Bytes({ minLength: 28, maxLength: 28 });

export const MerkleRootSchema = Data.Bytes({ minLength: 32, maxLength: 32 });
export type MerkleRoot = Data.Static<typeof MerkleRootSchema>;
export const MerkleRoot = MerkleRootSchema as unknown as MerkleRoot;

export const CredentialSchema = Data.Enum([
  Data.Object({
    PublicKeyCredential: Data.Tuple([
      Data.Bytes({ minLength: 28, maxLength: 28 }),
    ]),
  }),
  Data.Object({
    ScriptCredential: Data.Tuple([
      Data.Bytes({ minLength: 28, maxLength: 28 }),
    ]),
  }),
]);
export type CredentialD = Data.Static<typeof CredentialSchema>;
export const CredentialD = CredentialSchema as unknown as CredentialD;

export const AddressSchema = Data.Object({
  paymentCredential: CredentialSchema,
  stakeCredential: Data.Nullable(
    Data.Enum([
      Data.Object({ Inline: Data.Tuple([CredentialSchema]) }),
      Data.Object({
        Pointer: Data.Tuple([
          Data.Object({
            slotNumber: Data.Integer(),
            transactionIndex: Data.Integer(),
            certificateIndex: Data.Integer(),
          }),
        ]),
      }),
    ]),
  ),
});
export type AddressData = Data.Static<typeof AddressSchema>;
export const AddressData = AddressSchema as unknown as AddressData;
