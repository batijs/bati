/*# BATI include-if-imported #*/
import sqlite, { type Database } from "better-sqlite3";

export const sqliteDb: Database = sqlite(":memory:");

/**
 * SQLite Schema
 *
 * @link {@see https://lucia-auth.com/database/sqlite#schema}
 */
sqliteDb.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT
)`);

sqliteDb.exec(`CREATE TABLE IF NOT EXISTS oauth_accounts (
    provider_id TEXT NOT NULL,
    provider_user_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (provider_id, provider_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE cascade ON DELETE cascade
)`);

sqliteDb.exec(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE cascade ON DELETE cascade
)`);
