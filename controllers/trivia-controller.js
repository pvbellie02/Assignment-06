/*
  Name: Pranav Bellie
  Date: 11.19.2026
  CSC 372-01

  This is trivia-controller.js. The controller validates each request, calls the
  model, and sends back the JSON response with an appropriate status code.
*/

let model = require('../models/trivia-model');

let validDifficulties = ['easy', 'medium', 'hard'];
let maxIdValue = 2147483647;

/**
 * Checks that a value is a string with something other than whitespace in it.
 * @param {*} value - The value to check.
 * @return {boolean} True if the value is a non-empty string.
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Logs an unexpected error and sends a generic 500 response.
 * @param {Object} res - The Express response.
 * @param {Error} error - The error that was caught.
 */
function sendServerError(res, error) {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong on the server.' });
}

/**
 * GET /triviabook/topics - responds with the list of all topics.
 * @param {Object} req - The Express request.
 * @param {Object} res - The Express response.
 */
async function getTopics(req, res) {
  try {
    let topics = await model.getTopics();
    res.json(topics);
  } catch (error) {
    sendServerError(res, error);
  }
}

/**
 * GET /triviabook/topic/:topic - responds with the questions in a topic.
 * Optional query parameters: limit (positive whole number) and difficulty.
 * @param {Object} req - The Express request.
 * @param {Object} res - The Express response.
 */
async function getQuestionsInTopic(req, res) {
  try {
    let topic = req.params.topic.trim();
    let difficulty = null;
    let limit = null;

    if (req.query.difficulty !== undefined) {
      let requested = req.query.difficulty;
      if (typeof requested !== 'string' ||
          !validDifficulties.includes(requested.trim().toLowerCase())) {
        res.status(400).json({ error: 'difficulty must be easy, medium, or hard.' });
        return;
      }
      difficulty = requested.trim().toLowerCase();
    }

    if (req.query.limit !== undefined) {
      let requested = req.query.limit;
      if (typeof requested !== 'string' || !/^[1-9][0-9]{0,8}$/.test(requested.trim())) {
        res.status(400).json({ error: 'limit must be a positive whole number.' });
        return;
      }
      limit = Number(requested.trim());
    }

    let exists = await model.topicExists(topic);
    if (!exists) {
      res.status(404).json({ error: 'Topic "' + topic + '" was not found.' });
      return;
    }

    let questions = await model.getQuestionsByTopic(topic, difficulty, limit);
    res.json(questions);
  } catch (error) {
    sendServerError(res, error);
  }
}

/**
 * GET /triviabook/random - responds with one random question, without its answer.
 * @param {Object} req - The Express request.
 * @param {Object} res - The Express response.
 */
async function getRandomQuestion(req, res) {
  try {
    let question = await model.getRandomQuestion();
    if (!question) {
      res.status(404).json({ error: 'There are no questions in the database yet.' });
      return;
    }
    res.json(question);
  } catch (error) {
    sendServerError(res, error);
  }
}

/**
 * POST /triviabook/answer - checks a guess against the correct answer.
 * The body must include id (question id) and guess.
 * @param {Object} req - The Express request.
 * @param {Object} res - The Express response.
 */
async function checkAnswer(req, res) {
  try {
    let body = req.body || {};
    let id = body.id;
    let guess = body.guess;

    if (id === undefined || id === null || id === '' ||
        guess === undefined || guess === null) {
      res.status(400).json({ error: 'Both id and guess are required.' });
      return;
    }

    if (typeof guess === 'number') {
      guess = String(guess);
    }
    if (!isNonEmptyString(guess)) {
      res.status(400).json({ error: 'guess must be non-empty text.' });
      return;
    }

    let idNumber = (typeof id === 'number' || typeof id === 'string') ? Number(id) : NaN;
    if (!Number.isInteger(idNumber) || idNumber < 1 || idNumber > maxIdValue) {
      res.status(400).json({ error: 'id must be a positive whole number.' });
      return;
    }

    let question = await model.getQuestionById(idNumber);
    if (!question) {
      res.status(404).json({ error: 'No question exists with id ' + idNumber + '.' });
      return;
    }

    let correct = guess.trim().toLowerCase() === question.answer.trim().toLowerCase();
    res.json({ id: question.id, correct: correct, correctAnswer: question.answer });
  } catch (error) {
    sendServerError(res, error);
  }
}

/**
 * POST /triviabook/question/add - adds a question (creating the topic if needed)
 * and responds with the updated list of questions for that topic.
 * The body must include topic, question, answer and difficulty.
 * @param {Object} req - The Express request.
 * @param {Object} res - The Express response.
 */
async function addQuestion(req, res) {
  try {
    let body = req.body || {};
    let requiredFields = ['topic', 'question', 'answer', 'difficulty'];
    let missing = requiredFields.filter(function (field) {
      return !isNonEmptyString(body[field]);
    });

    if (missing.length > 0) {
      res.status(400).json({
        error: 'Missing or empty required field(s): ' + missing.join(', ') + '.'
      });
      return;
    }

    let topic = body.topic.trim().toLowerCase();
    let question = body.question.trim();
    let answer = body.answer.trim();
    let difficulty = body.difficulty.trim().toLowerCase();

    if (!validDifficulties.includes(difficulty)) {
      res.status(400).json({ error: 'difficulty must be easy, medium, or hard.' });
      return;
    }

    await model.addQuestion(topic, question, answer, difficulty);
    let questions = await model.getQuestionsByTopic(topic, null, null);
    res.status(201).json(questions);
  } catch (error) {
    sendServerError(res, error);
  }
}

module.exports = {
  getTopics,
  getQuestionsInTopic,
  getRandomQuestion,
  checkAnswer,
  addQuestion
};
