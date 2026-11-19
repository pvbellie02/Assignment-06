/*
  Name: Pranav Bellie
  Date: 11.19.2026
  CSC 372-01

  This is server.js, the entry point for the trivia API. It creates the Express
  app, mounts the /triviabook router, and starts listening for requests.
*/

let express = require('express');
let triviaRouter = require('./routes/trivia-router');

let app = express();
let port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', function (req, res) {
  res.json({
    message: 'Trivia API is running.',
    endpoints: [
      'GET /triviabook/topics',
      'GET /triviabook/topic/:topic',
      'GET /triviabook/random',
      'POST /triviabook/answer',
      'POST /triviabook/question/add'
    ]
  });
});

app.use('/triviabook', triviaRouter);

// Any URL that no route handled.
app.use(function (req, res) {
  res.status(404).json({ error: 'Route not found.' });
});

// Error handler (for example, a request body that is not valid JSON).
app.use(function (error, req, res, next) {
  if (error.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Request body must be valid JSON.' });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(port, function () {
  console.log('Server listening on port ' + port);
});
