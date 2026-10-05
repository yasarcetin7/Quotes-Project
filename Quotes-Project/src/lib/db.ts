import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable')
}

if (!dbName) {
  throw new Error('Missing MONGODB_DB_NAME environment variable')
}

const client = new MongoClient(uri);

export async function getDb(): Promise<Db> {
  await client.connect();
  return client.db(dbName);
}

export enum Collections {
  quotes = 'quotes',
  user = 'users'
}