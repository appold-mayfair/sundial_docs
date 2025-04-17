import {
  Blockfrost,
  CML,
  coreToTxOutput,
  Koios,
  Kupmios,
  Lucid,
  LucidEvolution,
  Maestro,
  Network,
  Provider,
  UTxO,
  utxoToCore,
} from "@lucid-evolution/lucid";
import * as chalk_ from "chalk";
import { Effect } from "effect";

export interface WorkerInput {
  data: {
    command: string;
  };
}

export interface WorkerOutput {
  txSize: number;
  mempoolTxsCount: number;
  sizeOfBlocksTxs: number;
}

export const chalk = new chalk_.Chalk();

export type ProviderName = "Blockfrost" | "Koios" | "Kupmios" | "Maestro";

export const logSuccess = (msg: string) => {
  Effect.runSync(Effect.logInfo(`🎉 ${msg}`));
};

export const logWarning = (msg: string) => {
  Effect.runSync(Effect.logWarning(`⚠️  ${msg}`));
};

export const logAbort = (msg: string) => {
  Effect.runSync(Effect.logError(msg));
};

export const logInfo = (msg: string) => {
  Effect.runSync(Effect.logInfo(`ℹ️  ${msg}`));
};

export const isHexString = (str: string): boolean => {
  const hexRegex = /^[0-9A-Fa-f]+$/;
  return hexRegex.test(str);
};

export const setupLucid = async (
  network: Network,
  providerName: ProviderName,
): Promise<LucidEvolution> => {
  const seedPhrase = process.env.SEED_PHRASE;
  if (!seedPhrase) {
    logAbort("No wallet seed phrase found (SEED_PHRASE)");
    process.exit(1);
  }
  const networkStr = `${network}`.toLowerCase();
  let provider: Provider;
  if (providerName === "Blockfrost" || providerName === "Maestro") {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      logAbort("No API key was found (API_KEY)");
      process.exit(1);
    }
    if (providerName === "Blockfrost") {
      provider = new Blockfrost(
        `https://cardano-${networkStr}.blockfrost.io/api/v0`,
        apiKey,
      );
    } else {
      provider = new Maestro({
        network: network === "Custom" ? "Mainnet" : network,
        apiKey,
      });
    }
  } else if (providerName === "Koios") {
    provider = new Koios(
      `https://${network === "Mainnet" ? "api" : networkStr}.koios.rest/api/v1`,
    );
  } else {
    const kupoURL = process.env.KUPO_URL;
    const ogmiosURL = process.env.OGMIOS_URL;
    if (!kupoURL || !ogmiosURL) {
      logAbort(
        "Make sure to set both KUPO_URL and OGMIOS_URL environment variables",
      );
      process.exit(1);
    }
    provider = new Kupmios(kupoURL, ogmiosURL);
  }
  try {
    const lucid = await Lucid(provider, network);
    lucid.selectWallet.fromSeed(seedPhrase);
    return lucid;
  } catch (e) {
    logAbort(`${e}`);
    process.exit(1);
  }
};

export function utxoToCBOR(utxo: UTxO): {
  outputReference: Uint8Array;
  output: Uint8Array;
} {
  const cmlUTxO = utxoToCore(utxo);
  return {
    outputReference: cmlUTxO.input().to_cbor_bytes(),
    output: cmlUTxO.output().to_cbor_bytes(),
  };
}

export const findSpentAndProducedUTxOs = (txCBOR: Uint8Array) =>
  Effect.gen(function* () {
    const spent: Uint8Array[] = [];
    const produced: { outputReference: Uint8Array; output: Uint8Array }[] = [];
    const tx = CML.Transaction.from_cbor_bytes(txCBOR);
    const txBody = tx.body();
    const inputs = txBody.inputs();
    const outputs = txBody.outputs();
    for (let i = 0; i < inputs.len(); i++) {
      yield* Effect.try({
        try: () => spent.push(inputs.get(i).to_cbor_bytes()),
        catch: (e) => new Error(`${e}`),
      });
    }
    const txHash = CML.hash_transaction(txBody).to_hex();
    for (let i = 0; i < outputs.len(); i++) {
      yield* Effect.try({
        try: () => {
          const utxo: UTxO = {
            txHash: txHash,
            outputIndex: i,
            ...coreToTxOutput(outputs.get(i)),
          };
          produced.push(utxoToCBOR(utxo));
        },
        catch: (e) => new Error(`${e}`),
      });
    }
    return { spent, produced };
  });

export const findAllSpentAndProducedUTxOs = (
  txCBORs: Uint8Array[],
): Effect.Effect<
  {
    spent: Uint8Array[];
    produced: { outputReference: Uint8Array; output: Uint8Array }[];
  },
  Error
> =>
  Effect.gen(function* () {
    const allEffects = yield* Effect.all(
      txCBORs.map(findSpentAndProducedUTxOs),
    );
    return allEffects.reduce(
      (
        { spent: spentAcc, produced: producedAcc },
        { spent: currSpent, produced: currProduced },
      ) => {
        return {
          spent: [...spentAcc, ...currSpent],
          produced: [...producedAcc, ...currProduced],
        };
      },
    );
  });

export const ENV_VARS_GUIDE = `
Make sure you first have set the environment variable for your seed phrase:

\u0009${chalk.bold("SEED_PHRASE")}\u0009 Your wallet's seed phrase

Depending on which provider you'll be using, other environment variables may also be needed:

Blockfrost or Maestro:
\u0009${chalk.bold("API_KEY")}    \u0009 Your provider's API key

Kupmios:
\u0009${chalk.bold("KUPO_URL")}   \u0009 URL of your Kupo instance
\u0009${chalk.bold("OGMIOS_URL")} \u0009 URL of your Ogmios instance
`;
