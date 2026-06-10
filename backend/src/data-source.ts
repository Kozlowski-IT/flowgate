import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: ['../.env', '.env'] });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
