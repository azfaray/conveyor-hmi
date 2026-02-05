import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // REPLACE 'ConveyorProject2026' WITH YOUR NEW PASSWORD
    url: "postgresql://postgres.svsszrjzagoyyojutbwq:gs0bGl4HojdZgZEA@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
  },
});