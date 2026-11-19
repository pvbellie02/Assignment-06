/*
  Name: Pranav Bellie
  Date: 11.19.2026
  CSC 372-01

  This is trivia-model.js. The model is the only layer that talks to the
  database. Each function runs SQL and returns plain JavaScript data.
*/

let pool = require('../db');

/**
 * Gets the names of all topics.
 * @return {Promise<string[]>} The topic names in the order they were created.
 */
async function getTopics() {
  let result = await pool.query('SELECT name FROM topics ORDER BY id');
  return result.rows.map(function (row) {
    return row.name;
  });
}

/**
 * Checks whether a topic exists (case-insensitive).
 * @param {string} topic - The topic name to look for.
 * @return {Promise<boolean>} True if the topic exists.
 */
async function topicExists(topic) {
  let result = await pool.query(
    'SELECT 1 FROM topics WHERE LOWER(name) = LOWER($1)',
    [topic]
  );
  return result.rows.length > 0;
}

/**
 * Gets the questions in a topic, optionally filtered and limited.
 * @param {string} topic - The topic name (case-insensitive).
 * @param {string|null} difficulty - "easy", "medium", "hard", or null for all.
 * @param {number|null} limit - Maximum number of questions, or null for all.
 * @return {Promise<Object[]>} Questions with id, question, answer and difficulty.
 */
async function getQuestionsByTopic(topic, difficulty, limit) {
  let sql = 'SELECT q.id, q.question, q.answer, q.difficulty ' +
    'FROM questions q JOIN topics t ON t.id = q.topic_id ' +
    'WHERE LOWER(t.name) = LOWER($1)';
  let values = [topic];

  if (difficulty) {
    values.push(difficulty);
    sql += ' AND q.difficulty = $' + values.length;
  }

  sql += ' ORDER BY q.id';

  if (limit) {
    values.push(limit);
    sql += ' LIMIT $' + values.length;
  }

  let result = await pool.query(sql, values);
  return result.rows;
}

/**
 * Gets one random question without its answer.
 * @return {Promise<Object|null>} The question (id, topic, question, difficulty),
 *     or null if the database has no questions.
 */
async function getRandomQuestion() {
  let result = await pool.query(
    'SELECT q.id, t.name AS topic, q.question, q.difficulty ' +
    'FROM questions q JOIN topics t ON t.id = q.topic_id ' +
    'ORDER BY RANDOM() LIMIT 1'
  );
  return result.rows[0] || null;
}

/**
 * Gets a question by id, including its answer.
 * @param {number} id - The question id.
 * @return {Promise<Object|null>} The question row, or null if it does not exist.
 */
async function getQuestionById(id) {
  let result = await pool.query(
    'SELECT id, question, answer, difficulty FROM questions WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Adds a question, creating the topic first if it does not exist yet.
 * @param {string} topic - The topic name.
 * @param {string} question - The question text.
 * @param {string} answer - The answer text.
 * @param {string} difficulty - "easy", "medium", or "hard".
 * @return {Promise<void>} Resolves when the question has been saved.
 */
async function addQuestion(topic, question, answer, difficulty) {
  let topicResult = await pool.query(
    'INSERT INTO topics (name) VALUES ($1) ' +
    'ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
    [topic]
  );
  let topicId = topicResult.rows[0].id;

  await pool.query(
    'INSERT INTO questions (topic_id, question, answer, difficulty) VALUES ($1, $2, $3, $4)',
    [topicId, question, answer, difficulty]
  );
}

module.exports = {
  getTopics,
  topicExists,
  getQuestionsByTopic,
  getRandomQuestion,
  getQuestionById,
  addQuestion
};
