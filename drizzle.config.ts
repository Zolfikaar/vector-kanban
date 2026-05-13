/// <reference types="node" />
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!, // سيقرأ الرابط كما هو من .env
  },
});