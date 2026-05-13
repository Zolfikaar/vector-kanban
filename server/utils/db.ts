// server/utils/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../database/schema';

let dbInstance: any = null;

export const useDb = () => {
  if (!dbInstance) {
    const config = useRuntimeConfig();
    // الرابط من env سيقرأه Nuxt تلقائياً هنا
    const client = postgres(config.databaseUrl, {
      prepare: false // ضروري جداً للمنفذ 6543
    });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
};