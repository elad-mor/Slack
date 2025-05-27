require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON parser
app.use(bodyParser.json());

// Slack routes
app.use('/slack/events', require('./routes/slackEvents'));
app.use('/slack/interact', require('./routes/slackInteractions'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
