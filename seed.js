/*
  Name: Pranav Bellie
  Date: 11.19.2026
  CSC 372-01

  This is seed.js. Run it once with "npm run seed" to create the tables from
  schema.sql and insert the starting trivia data. If the topics table already
  has data, it does nothing so that existing questions are never duplicated.
*/

let fs = require('fs');
let path = require('path');
let pool = require('./db');

let topics = ['science', 'geography'];

let scienceQuestions = [
  { question: 'What planet is known as the Red Planet?', answer: 'Mars', difficulty: 'easy' },
  { question: 'What is the chemical symbol for gold?', answer: 'Au', difficulty: 'medium' },
  { question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', difficulty: 'easy' }
];

let geographyQuestions = [
  { question: 'What is the capital of Australia?', answer: 'Canberra', difficulty: 'medium' },
  { question: 'Which river flows through Cairo?', answer: 'The Nile', difficulty: 'easy' }
];

let questionsByTopic = {
  science: scienceQuestions,
  geography: geographyQuestions
};

/**
 * Creates the tables and inserts the seed data if the database is empty.
 * @return {Promise<void>} Resolves when seeding is finished.
 */
async function seed() {
  let schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  let existing = await pool.query('SELECT COUNT(*) AS total FROM topics');
  if (Number(existing.rows[0].total) > 0) {
    console.log('Database already has data. Nothing was seeded.');
    return;
  }

  for (let i = 0; i < topics.length; i++) {
    let topicName = topics[i];
    let topicResult = await pool.query(
      'INSERT INTO topics (name) VALUES ($1) RETURNING id',
      [topicName]
    );
    let topicId = topicResult.rows[0].id;
    let questions = questionsByTopic[topicName];

    for (let j = 0; j < questions.length; j++) {
      await pool.query(
        'INSERT INTO questions (topic_id, question, answer, difficulty) VALUES ($1, $2, $3, $4)',
        [topicId, questions[j].question, questions[j].answer, questions[j].difficulty]
      );
    }
  }
  console.log('Database seeded.');
}

seed()
  .catch(function (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(function () {
    pool.end();
  });
