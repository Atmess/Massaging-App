require('dotenv/config');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma/client.js');

const connectionString = process.env.DATABASE_URL;

// Let's print this out so we can see what it's reading
console.log("Checking DATABASE_URL:", connectionString ? "Loaded successfully!" : "UNDEFINED!");

if (!connectionString || typeof connectionString !== 'string') {
  throw new Error(`CRITICAL: DATABASE_URL must be a string, but got ${typeof connectionString}`);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;