require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Read Slack Bot Token from environment
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

// Parse JSON bodies
app.use(bodyParser.json());

// Slack Events endpoint
app.post('/slack/events', async (req, res) => {
  const { type, challenge, event } = req.body;

  // Respond to Slack URL verification
  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  // Respond when bot is mentioned
  if (type === 'event_callback' && event.type === 'app_mention') {
    const replyText = `👋 Hello <@${event.user}>! I saw your mention.`;

    try {
      await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: event.channel,
          text: replyText
        },
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error posting message to Slack:', error.response?.data || error.message);
    }
  }

  res.status(200).send('OK');
});

// Optional: serve static HTML from /public
app.use(express.static('public'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
