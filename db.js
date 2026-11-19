/*
  Name: Pranav Bellie
  Date: 11.19.2026
  CSC 372-01

  This is db.js. It loads the environment variables from the .env file and
  creates the shared PostgreSQL connection pool (Neon) used by the models.
*/

require('dotenv').config({ quiet: true, override: true });
let { Pool } = require('pg');

let pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
