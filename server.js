const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON
app.use(bodyParser.json());

// Slack Events endpoint
app.post('/slack/events', (req, res) => {
  const { type, challenge } = req.body;

  if (type === 'url_verification') {
    return res.status(200).send(challenge); // Must send plain text
  }

  res.status(200).send('OK');
});

// Optional: serve index.html if desired
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
