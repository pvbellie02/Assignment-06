# Trivia API (Assignment 6)

A Node/Express API backed by a Neon Postgres database. It follows a
model / controller / router structure.

**Live app:** https://YOUR-APP-NAME.onrender.com/triviabook/topics

## Database schema

**topics**

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | SERIAL | primary key |
| name | TEXT | required, unique (stored in lowercase) |

**questions**

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | SERIAL | primary key |
| topic_id | INTEGER | required, foreign key to topics(id) |
| question | TEXT | required |
| answer | TEXT | required |
| difficulty | TEXT | required, must be `easy`, `medium`, or `hard` |

## Setup

1. Install dependencies: `npm install`
2. Create a Neon Postgres project and copy its connection string.
3. Create a file named `.env` in the project folder (see `.env.example`):
   `DATABASE_URL=your-neon-connection-string`
4. Create the tables and insert the seed data: `npm run seed`
5. Start the server: `npm start` (runs on http://localhost:3000)

On Render, set the build command to `npm install`, the start command to
`npm start`, and add `DATABASE_URL` in the service's Environment settings.

## Endpoints

| Method | URL | Description |
| ------ | --- | ----------- |
| GET | `/triviabook/topics` | List all topic names. |
| GET | `/triviabook/topic/:topic` | List the questions in a topic. Optional query parameters: `limit` (positive whole number) and `difficulty` (`easy`, `medium`, `hard`). Returns 404 for an unknown topic and 400 for an invalid `limit` or `difficulty`. |
| GET | `/triviabook/random` | One random question (id, topic, question, difficulty) without the answer. |
| POST | `/triviabook/answer` | Body: `{ "id": 1, "guess": "Mars" }`. Returns `{ id, correct, correctAnswer }`. The guess is case-insensitive and ignores leading and trailing spaces. Returns 400 if `id` or `guess` is missing and 404 if the question does not exist. |
| POST | `/triviabook/question/add` | Body: `{ "topic", "question", "answer", "difficulty" }`. Creates the topic if needed and returns the updated list of questions for that topic (201). Returns 400 if a field is missing or `difficulty` is invalid. |
