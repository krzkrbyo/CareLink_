/**
 * Aplica la migración 008 en Supabase (requiere SUPABASE_SERVICE_ROLE_KEY en .env.local).
 * Uso: npx tsx scripts/apply-migration-008.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(name: string) {
  try {
    const text = readFileSync(join(process.cwd(), name), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional file
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/008_elder_personal_reminders.sql"),
  "utf8"
);

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
  if (dbUrl) {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    for (const statement of statements) {
      await client.query(statement);
      console.log("OK:", statement.split("\n")[0].slice(0, 60));
    }
    await client.end();
    console.log("Migración 008 aplicada vía DATABASE_URL.");
    return;
  }

  // Prueba insert personal para verificar si la migración ya está aplicada
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const elderId = process.env.DEMO_ELDER_ID ?? "00000000-0000-4000-8000-000000000001";
  const { error } = await supabase.from("reminders").insert({
    elder_id: elderId,
    type: "personal",
    title: "__migration_test__",
    due_at: new Date(Date.now() + 3600_000).toISOString(),
    status: "pending",
  });

  if (!error) {
    await supabase.from("reminders").delete().eq("title", "__migration_test__");
    console.log("Migración 008 ya aplicada (tipo personal aceptado).");
    return;
  }

  console.error(
    "La migración 008 NO está aplicada. Ejecute el SQL manualmente en Supabase → SQL Editor:\n"
  );
  console.error(sql);
  console.error("\nError de prueba:", error.message, error.code);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
