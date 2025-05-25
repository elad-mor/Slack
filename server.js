const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve static index.html (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Slack events endpoint
app.post('/slack/events', (req, res) => {
  const { type, challenge } = req.body;

  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  res.status(200).send('Event received');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
