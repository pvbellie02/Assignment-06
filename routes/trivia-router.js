/*
  Name: Pranav Bellie
  Date: 11.19.2026
  CSC 372-01

  This is trivia-router.js. The router maps each /triviabook URL and HTTP method
  to the matching controller function.
*/

let express = require('express');
let controller = require('../controllers/trivia-controller');

let router = express.Router();

router.get('/topics', controller.getTopics);
router.get('/topic/:topic', controller.getQuestionsInTopic);
router.get('/random', controller.getRandomQuestion);
router.post('/answer', controller.checkAnswer);
router.post('/question/add', controller.addQuestion);

module.exports = router;
