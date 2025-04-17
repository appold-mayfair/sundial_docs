import { CML, UTxO } from "@lucid-evolution/lucid";
import { Option } from "effect";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  BlocksDB,
  ConfirmedLedgerDB,
  ImmutableDB,
  LatestLedgerDB,
  MempoolDB,
  MempoolLedgerDB,
} from "../src/database/index.js";
import { initializeDb } from "../src/database/utils.js";
import { utxoToCBOR } from "../src/transactions/utils.js";

describe("database", () => {
  const lucid = new MockLucid();
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({
      user: "postgres",
      host: "localhost",
      database: "database",
      password: "postgres",
      port: 5432,
    });
    await initializeDb(pool);
  });

  afterAll(async () => {
    await dropTables(pool);
    await pool.end();
  });

  const tx1 =
    "84a300d9010281825820000000000000000000000000000000000000000000000000000000000000000000019582581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d605ceb8240667acbd2cb93d8efe342c0b9fa51f04678e3d5cddec94a881a05f5b9f082581d603b493979352930f3eccbd47ae0e12ef6dcea89326211cd80f87cf85a1b00000001dcd95d400200a100d901028182582015c6708ee2da48b2c46c5ab3e001ff636fa0b0e2a48b6676dffc8e36fe02c5985840599c8a11e9888ab60c10f78c708b55f6b542c6d70fa57775b26efe519dc9459604f2e1633601e2b9e448181e694278f3a89d8fea462dcfd772a6a9248e1f730df5f6";
  const tx1CBOR = Buffer.from(tx1, "hex");
  const tx1Hash = lucid.fromTx(tx1).toHash();

  const tx2 =
    "84a300d90102818258207351d824f3565c936f87d67c7352e0d34f13a51e6427bfad2a86e49bbae8a2dc14019582581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60902644a3189c282d9a54e4aeac15f03b16bef0fc17dd8aa6f9bc8b8f1a05f5b9f082581d60f2d5d0b7f8198330ba9410ffecdf45dcc67e774849bfbe8115a8cfcf1b0000000165a6d6800200a100d9010281825820f80e638fcfe3a3d60a785202efa9ff231b804db638896eb4a63bf6e0acceda405840567525cdfd1ee65e702c28901adbc16915a46f140dd91669c160b9b9095691205a26f7f95411ece1f2a9cd19901a6525a449256d4232eadf061db137967f0a09f5f6";
  const tx2Hash = lucid.fromTx(tx2).toHash();
  const tx2CBOR = Buffer.from(tx2, "hex");

  const block1Hash = "aaaaaaaaaaaaaaaaaa";
  const block2Hash = "bbbbbbbbbbbbbbbbbb";

  const address =
    "addr1q8gg2r3vf9zggn48g7m8vx62rwf6warcs4k7ej8mdzmqmesj30jz7psduyk6n4n2qrud2xlv9fgj53n6ds3t8cs4fvzs05yzmz";
  const utxo1: UTxO = {
    txHash: tx1Hash,
    outputIndex: 0,
    address: address,
    assets: {
      c5334d60505f62b715b098cb5f9a391416a6ed2064c7d813e03a11c1e2fb72ac0da4e312c4a0a27b73a59eba40ee6848131f82fc62be628ab72e490e:
        BigInt(12),
      lovelace: BigInt("9223372036854779904"),
    },
    datum:
      "e100c1a248cb3e9eb91d1534b176a410312a283100345de6d7f3b7b55ea7b067b4b46a43dca4f674b0682b06ed9f",
    datumHash:
      "9eead0de42833bbd51866cbafe5d29b8448fa1b9e7430a7af7a7f0e7e9913a07",
    scriptRef: null,
  };
  const utxo1OutRef = {
    txHash: utxo1.txHash,
    outputIndex: utxo1.outputIndex,
  };
  const utxo1CBOR = utxoToCBOR(utxo1);

  const utxo2: UTxO = {
    txHash: tx2Hash,
    outputIndex: 1,
    address: address,
    assets: { lovelace: BigInt(33) },
    datum: null,
    datumHash: null,
    scriptRef: {
      type: "PlutusV3",
      script:
        "6e461fe947e14c4a53b905d0aa92f08bff98fb94129f6ed26877fcf1c8a4495192c0b379fb06aa3b",
    },
  };
  const utxo2OutRef = {
    txHash: utxo2.txHash,
    outputIndex: utxo2.outputIndex,
  };
  const utxo2CBOR = utxoToCBOR(utxo2);

  it("should store tx hashes in blocks db", async () => {
    await BlocksDB.insert(pool, block1Hash, [tx1Hash]);
    const result1 = await BlocksDB.retrieve(pool);
    expect(result1).toStrictEqual([[block1Hash, tx1Hash]]);

    await BlocksDB.insert(pool, block1Hash, [tx2Hash]);
    const result2 = await BlocksDB.retrieve(pool);
    expect(result2).toStrictEqual([
      [block1Hash, tx1Hash],
      [block1Hash, tx2Hash],
    ]);
  });

  it("retrieves tx hashes by block hash", async () => {
    const result1 = await BlocksDB.retrieveTxHashesByBlockHash(
      pool,
      block1Hash,
    );
    expect(result1).toEqual([tx1Hash, tx2Hash]);

    const result2 = await BlocksDB.retrieveTxHashesByBlockHash(
      pool,
      block2Hash,
    );
    expect(result2).toEqual([]);
  });

  it("retrieves block hash by tx hash", async () => {
    const result1 = await BlocksDB.retrieveBlockHashByTxHash(pool, tx1Hash);
    expect(result1).toEqual(Option.some(block1Hash));

    const result2 = await BlocksDB.retrieveBlockHashByTxHash(pool, block2Hash);
    expect(result2).toEqual(Option.none());
  });

  it("clears given block in the blocks db", async () => {
    const nonExistintBlockHash = "1234";
    await BlocksDB.clearBlock(pool, nonExistintBlockHash);
    const result1 = await BlocksDB.retrieve(pool);
    expect(result1.map((o) => Object.values(o))).toStrictEqual([
      [block1Hash, tx1Hash],
      [block1Hash, tx2Hash],
    ]);
    const block3Hash = "cccccccccccccccc";
    await BlocksDB.insert(pool, block3Hash, ["11", "22"]);
    await BlocksDB.clearBlock(pool, block3Hash);
    const result2 = await BlocksDB.retrieve(pool);
    expect(result2.map((o) => Object.values(o))).toStrictEqual([
      [block1Hash, tx1Hash],
      [block1Hash, tx2Hash],
    ]);
  });

  it("clears blocks db", async () => {
    await BlocksDB.clear(pool);
    const result = await BlocksDB.retrieve(pool);
    expect(result).toStrictEqual([]);
  });

  it("should store transactions in the mempool db", async () => {
    await BlocksDB.insert(pool, block1Hash, [tx1Hash]);
    await BlocksDB.insert(pool, block2Hash, [tx2Hash]);
    await MempoolDB.insert(pool, tx1Hash, tx1CBOR);
    const result1 = await MempoolDB.retrieve(pool);
    expect(result1.map((o) => Object.values(o))).toStrictEqual([
      [tx1Hash, tx1CBOR],
    ]);

    await MempoolDB.insert(pool, tx2Hash, tx2CBOR);
    const result2 = await MempoolDB.retrieve(pool);
    expect(result2.map((o) => Object.values(o))).toStrictEqual([
      [tx1Hash, tx1CBOR],
      [tx2Hash, tx2CBOR],
    ]);
  });

  it("retrieves tx by hash in the mempool db", async () => {
    const nonExistentTxHash = "1234";
    const result1 = await MempoolDB.retrieveTxCborByHash(
      pool,
      nonExistentTxHash,
    );
    expect(result1).toEqual(Option.none());

    const result2 = await MempoolDB.retrieveTxCborByHash(pool, tx1Hash);
    expect(result2).toEqual(Option.some(tx1CBOR));
  });

  it("retrieves txs by hashes in the mempool db", async () => {
    const nonExistentTxHash = "1234";
    const result1 = await MempoolDB.retrieveTxCborsByHashes(pool, [
      nonExistentTxHash,
    ]);
    expect(result1).toEqual([]);

    const result2 = await MempoolDB.retrieveTxCborsByHashes(pool, [tx1Hash]);
    expect(result2).toEqual([tx1CBOR]);

    const result3 = await MempoolDB.retrieveTxCborsByHashes(pool, [
      tx1Hash,
      tx2Hash,
    ]);
    expect(result3).toEqual([tx1CBOR, tx2CBOR]);
  });

  it("clears particular txs in the mempool db", async () => {
    const nonExistentTx = "aaaa1111";
    await MempoolDB.clearTxs(pool, [tx1Hash, nonExistentTx]);
    const result1 = await MempoolDB.retrieve(pool);
    expect(result1.map((r) => Object.values(r))).toEqual([[tx2Hash, tx2CBOR]]);
  });

  it("clears the mempool db", async () => {
    const initialRows = await MempoolDB.retrieve(pool);
    expect(initialRows.length).toBe(1);
    await MempoolDB.clear(pool);
    const result = await MempoolDB.retrieve(pool);
    expect(result.length).toBe(0);
  });

  it("should store utxos in the mempool ledger db", async () => {
    await MempoolLedgerDB.insert(pool, [
      { outRef: utxo1OutRef, utxoCBOR: utxo1CBOR },
    ]);
    const result1 = await MempoolLedgerDB.retrieve(pool);
    expect(result1.map((r) => Object.values(r))).toStrictEqual([
      [utxo1OutRef, utxo1CBOR],
    ]);

    await MempoolLedgerDB.insert(pool, [
      { outRef: utxo2OutRef, utxoCBOR: utxo2CBOR },
    ]);
    const result2 = await MempoolLedgerDB.retrieve(pool);
    expect(result2.map((r) => Object.values(r))).toStrictEqual([
      [utxo1OutRef, utxo1CBOR],
      [utxo2OutRef, utxo2CBOR],
    ]);
  });

  it("clears given utxo in the mempool ledger db", async () => {
    await MempoolLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo1.txHash,
        outputIndex: utxo2.outputIndex,
      },
    ]);
    const result0 = await MempoolLedgerDB.retrieve(pool);
    expect(result0.map((r) => Object.values(r))).toEqual([
      [utxo1OutRef, utxo1CBOR],
      [utxo2OutRef, utxo2CBOR],
    ]);

    await MempoolLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo1.txHash,
        outputIndex: utxo1.outputIndex,
      },
    ]);
    const result1 = await MempoolLedgerDB.retrieve(pool);
    expect(result1.map((r) => Object.values(r))).toEqual([
      [utxo2OutRef, utxo2CBOR],
    ]);

    await MempoolLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo2.txHash,
        outputIndex: utxo2.outputIndex,
      },
    ]);
    const result2 = await MempoolLedgerDB.retrieve(pool);
    expect(result2).toEqual([]);
  });

  it("clears the mempool ledger db", async () => {
    await MempoolLedgerDB.insert(pool, [
      { outRef: utxo1OutRef, utxoCBOR: utxo1CBOR },
      { outRef: utxo2OutRef, utxoCBOR: utxo2CBOR },
    ]);
    const initialRows = await MempoolLedgerDB.retrieve(pool);
    expect(initialRows.length).toBe(2);
    await MempoolLedgerDB.clear(pool);
    const result = await MempoolLedgerDB.retrieve(pool);
    expect(result.length).toBe(0);
  });

  it("should store transactions in the immutable db", async () => {
    await ImmutableDB.insert(pool, tx1Hash, tx1CBOR);
    const result1 = await ImmutableDB.retrieve(pool);
    expect(result1.map((r) => Object.values(r))).toStrictEqual([
      [tx1Hash, tx1CBOR],
    ]);

    await ImmutableDB.insert(pool, tx2Hash, tx2CBOR);
    const result2 = await ImmutableDB.retrieve(pool);
    expect(result2.map((o) => Object.values(o))).toStrictEqual([
      [tx1Hash, tx1CBOR],
      [tx2Hash, tx2CBOR],
    ]);
  });

  it("retrieves tx by hash in the immutable db", async () => {
    const nonExistentTxHash = "1234";
    const result1 = await ImmutableDB.retrieveTxCborByHash(
      pool,
      nonExistentTxHash,
    );
    expect(result1).toEqual(Option.none());

    const result2 = await ImmutableDB.retrieveTxCborByHash(pool, tx1Hash);
    expect(result2).toEqual(Option.some(tx1CBOR));
  });

  it("retrieves txs by hashes in the mempool db", async () => {
    const nonExistentTxHash = "1234";
    const result1 = await ImmutableDB.retrieveTxCborsByHashes(pool, [
      nonExistentTxHash,
    ]);
    expect(result1).toEqual([]);

    const result2 = await ImmutableDB.retrieveTxCborsByHashes(pool, [tx1Hash]);
    expect(result2).toEqual([tx1CBOR]);

    const result3 = await ImmutableDB.retrieveTxCborsByHashes(pool, [
      tx1Hash,
      tx2Hash,
    ]);
    expect(result3).toEqual([tx1CBOR, tx2CBOR]);
  });

  it("clears the immutable db", async () => {
    const initialRows = await ImmutableDB.retrieve(pool);
    expect(initialRows.length).toBe(2);
    await ImmutableDB.clear(pool);
    const result = await ImmutableDB.retrieve(pool);
    expect(result.length).toBe(0);
  });

  it("should store utxos in the confirmed ledger db", async () => {
    await ImmutableDB.insert(pool, tx1Hash, tx1CBOR);
    await ImmutableDB.insert(pool, tx2Hash, tx2CBOR);
    await ConfirmedLedgerDB.insert(pool, [
      { outRef: utxo1OutRef, utxoCBOR: utxo1CBOR },
    ]);
    const result1 = await ConfirmedLedgerDB.retrieve(pool);
    expect(result1.map((o) => Object.values(o))).toStrictEqual([
      [utxo1OutRef, utxo1CBOR],
    ]);

    await ConfirmedLedgerDB.insert(pool, [
      { outRef: utxo2OutRef, utxoCBOR: utxo2CBOR },
    ]);
    const result2 = await ConfirmedLedgerDB.retrieve(pool);
    expect(result2.map((o) => Object.values(o))).toStrictEqual([
      [utxo1OutRef, utxo1CBOR],
      [utxo2OutRef, utxo2CBOR],
    ]);
  });

  it("clears given utxo in the confirmed ledger db", async () => {
    await ConfirmedLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo1.txHash,
        outputIndex: utxo2.outputIndex,
      },
    ]);
    const result0 = await ConfirmedLedgerDB.retrieve(pool);
    expect(result0.map((o) => Object.values(o))).toEqual([
      [utxo1OutRef, utxo1CBOR],
      [utxo2OutRef, utxo2CBOR],
    ]);

    await ConfirmedLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo1.txHash,
        outputIndex: utxo1.outputIndex,
      },
    ]);
    const result1 = await ConfirmedLedgerDB.retrieve(pool);
    expect(result1.map((o) => Object.values(o))).toEqual([
      [utxo2OutRef, utxo2CBOR],
    ]);

    await ConfirmedLedgerDB.insert(pool, [
      { outRef: utxo1OutRef, utxoCBOR: utxo1CBOR },
    ]);
    await ConfirmedLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo2.txHash,
        outputIndex: utxo2.outputIndex,
      },
      {
        txHash: utxo1.txHash,
        outputIndex: utxo1.outputIndex,
      },
    ]);
    const result2 = await ConfirmedLedgerDB.retrieve(pool);
    expect(result2.map((o) => Object.values(o))).toEqual([]);
  });

  it("clears the confirmed ledger db", async () => {
    await ConfirmedLedgerDB.insert(pool, [
      { outRef: utxo1OutRef, utxoCBOR: utxo1CBOR },
      { outRef: utxo2OutRef, utxoCBOR: utxo2CBOR },
    ]);
    const initialRows = await ConfirmedLedgerDB.retrieve(pool);
    expect(initialRows.length).toBe(2);
    await ConfirmedLedgerDB.clear(pool);
    const result = await ConfirmedLedgerDB.retrieve(pool);
    expect(result.length).toBe(0);
  });

  it("should store utxos in the latest ledger db", async () => {
    await LatestLedgerDB.insert(pool, [
      { outRef: utxo1OutRef, utxoCBOR: utxo1CBOR },
    ]);
    const result1 = await LatestLedgerDB.retrieve(pool);
    expect(result1.map((o) => Object.values(o))).toStrictEqual([
      [utxo1OutRef, utxo1CBOR],
    ]);

    await LatestLedgerDB.insert(pool, [
      { outRef: utxo2OutRef, utxoCBOR: utxo2CBOR },
    ]);
    const result2 = await LatestLedgerDB.retrieve(pool);
    expect(result2.map((o) => Object.values(o))).toStrictEqual([
      [utxo1OutRef, utxo1CBOR],
      [utxo2OutRef, utxo2CBOR],
    ]);
  });

  it("clears given utxo in the latest ledger db", async () => {
    await LatestLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo1.txHash,
        outputIndex: utxo2.outputIndex,
      },
    ]);
    const result0 = await LatestLedgerDB.retrieve(pool);
    expect(result0.map((o) => Object.values(o))).toEqual([
      [utxo1OutRef, utxo1CBOR],
      [utxo2OutRef, utxo2CBOR],
    ]);

    await LatestLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo1.txHash,
        outputIndex: utxo1.outputIndex,
      },
    ]);
    const result1 = await LatestLedgerDB.retrieve(pool);
    expect(result1.map((o) => Object.values(o))).toEqual([
      [utxo2OutRef, utxo2CBOR],
    ]);

    await LatestLedgerDB.insert(pool, [
      { outRef: utxo1OutRef, utxoCBOR: utxo1CBOR },
    ]);
    await LatestLedgerDB.clearUTxOs(pool, [
      {
        txHash: utxo2.txHash,
        outputIndex: utxo2.outputIndex,
      },
      {
        txHash: utxo1.txHash,
        outputIndex: utxo1.outputIndex,
      },
    ]);
    const result2 = await LatestLedgerDB.retrieve(pool);
    expect(result2).toEqual([]);
  });

  it("clears the latest ledger db", async () => {
    await LatestLedgerDB.insert(pool, [
      { outRef: utxo1OutRef, utxoCBOR: utxo1CBOR },
      { outRef: utxo2OutRef, utxoCBOR: utxo2CBOR },
    ]);
    const initialRows = await LatestLedgerDB.retrieve(pool);
    expect(initialRows.length).toBe(2);
    await LatestLedgerDB.clear(pool);
    const result = await LatestLedgerDB.retrieve(pool);
    expect(result.length).toBe(0);
  });
});

class MockLucid {
  fromTx(tx: string) {
    const tx_body = CML.Transaction.from_cbor_hex(tx).body();
    return {
      toHash: () => CML.hash_transaction(tx_body).to_hex(),
    };
  }
}

const dropTables = async (pool: Pool): Promise<void> => {
  const tableNames = [
    "latest_ledger",
    "confirmed_ledger",
    "immutable",
    "mempool_ledger",
    "mempool",
    "blocks",
  ];
  for (const table of tableNames) {
    const query = `DROP TABLE IF EXISTS ${table} CASCADE;`;
    await pool.query(query);
    console.log(`${table} has been dropped successfully.`);
  }
};
