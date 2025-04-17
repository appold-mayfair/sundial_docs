import { Option } from "effect";
import { Pool } from "pg";
import { clearTable } from "./utils.js";

export const tableName = "blocks";

export const createQuery = `
  CREATE TABLE IF NOT EXISTS ${tableName} (
    header_hash BYTEA NOT NULL,
    tx_hash BYTEA NOT NULL UNIQUE
  );`;

export const insert = async (
  pool: Pool,
  headerHash: Uint8Array,
  txHashes: Uint8Array[],
): Promise<void> => {
  const query = `
      INSERT INTO ${tableName} (header_hash, tx_hash)
      VALUES
      ${txHashes.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}`;
  const values = txHashes.flatMap((txHash) => [headerHash, txHash]);

  try {
    await pool.query(query, values);
    // logInfo(`${tableName} db: ${txHashes.length} new tx_hashes added`);
  } catch (err) {
    // logAbort(`${tableName} db: inserting error: ${err}`);
    throw err;
  }
};

export const retrieveTxHashesByBlockHash = async (
  pool: Pool,
  blockHash: Uint8Array,
): Promise<Uint8Array[]> => {
  const query = `SELECT tx_hash FROM ${tableName} WHERE header_hash = $1`;
  try {
    const result = await pool.query(query, [blockHash]);
    return result.rows.map((row) => row.tx_hash);
  } catch (err) {
    // logAbort(`${tableName} db: retrieving error: ${err}`);
    throw err;
  }
};

export const retrieveBlockHashByTxHash = async (
  pool: Pool,
  txHash: Uint8Array,
): Promise<Option.Option<Uint8Array>> => {
  const query = `SELECT header_hash FROM ${tableName} WHERE tx_hash = $1`;
  try {
    const result = await pool.query(query, [txHash]);
    if (result.rows.length > 0) {
      return Option.some(result.rows[0].header_hash);
    } else {
      return Option.none();
    }
  } catch (err) {
    // logAbort(`${tableName} db: retrieving error: ${err}`);
    throw err;
  }
};

export const clearBlock = async (
  pool: Pool,
  blockHash: Uint8Array,
): Promise<void> => {
  const query = `DELETE FROM ${tableName} WHERE header_hash = $1`;
  try {
    await pool.query(query, [blockHash]);
    // logInfo(`${tableName} db: cleared`);
  } catch (err) {
    // logAbort(`${tableName} db: clearing error: ${err}`);
    throw err;
  }
};

export const retrieve = async (
  pool: Pool,
): Promise<[Uint8Array, Uint8Array][]> => {
  const query = `SELECT * FROM ${tableName}`;
  try {
    const result = await pool.query(query);
    return result.rows.map((row) => [row.header_hash, row.tx_hash]);
  } catch (err) {
    // logAbort(`${tableName} db: retrieving error: ${err}`);
    throw err;
  }
};

export const clear = async (pool: Pool) => clearTable(pool, tableName);
