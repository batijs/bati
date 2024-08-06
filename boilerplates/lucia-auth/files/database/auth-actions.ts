import { drizzleDb } from "@batijs/drizzle/database/drizzleDb";
import { sqliteDb } from "./sqliteDb";
import { userTable, oauthAccountTable } from "./schema/auth";
import { eq, and } from "drizzle-orm";

export function getExistingUser(username: string) {
  if (BATI.has("drizzle")) {
    return drizzleDb.select().from(userTable).where(eq(userTable.username, username)).get();
  } else {
    return sqliteDb.prepare("SELECT * FROM users WHERE username = ?").get(username);
  }
}

export function getExistingAccount(providerId: string, providerUserId: number) {
  if (BATI.has("drizzle")) {
    return drizzleDb
      .select()
      .from(oauthAccountTable)
      .where(and(eq(oauthAccountTable.providerId, providerId), eq(oauthAccountTable.providerUserId, providerUserId)))
      .get();
  } else {
    return sqliteDb
      .prepare("SELECT * FROM oauth_accounts WHERE provider_id = ? AND provider_user_id = ?")
      .get(providerId, providerUserId);
  }
}

export function validateInput(username: string | null, password: string | null) {
  const error: {
    username: string | null;
    password: string | null;
  } = {
    username: null,
    password: null,
  };

  if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
    error.username = "Invalid username";
  }
  if (!password || password.length < 6 || password.length > 255) {
    error.password = "Invalid password";
  }

  if (error.username || error.password) {
    return {
      error,
      success: false,
    };
  }
  return {
    error,
    success: true,
  };
}
