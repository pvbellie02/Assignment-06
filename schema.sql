-- Name: Pranav Bellie
-- Date: 11.19.2026
-- CSC 372-01
--
-- This is schema.sql. It creates the tables for the trivia API. It is safe to
-- run more than once because every table uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard'))
);
