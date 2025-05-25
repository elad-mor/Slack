require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Read Slack bot token from .env or Render environment
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

app.use(bodyParser.json());

// Main Slack endpoint
app.post('/slack/events', async (req, res) => {
  console.log('Slack event received:', req.body); // ✅ Log full event

  const { type, challenge, event } = req.body;

  // Step 1: Respond to Slack URL verification
  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  // Step 2: Handle mentions
  if (type === 'event_callback' && event.type === 'app_mention') {
    console.log('Bot was mentioned!');

    const message = `👋 Hello <@${event.user}>! I saw your mention.`;

    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: event.channel,
          text: message
        },
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // ✅ Log Slack's actual response
      console.log('Slack API response:', response.data);
    } catch (error) {
      console.error('❌ Error sending message to Slack:', error.response?.data || error.message);
    }
  }

  // Step 3: Always respond 200 to Slack
  res.status(200).send('OK');
});

// Serve static files (optional)
app.use(express.static('public'));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
