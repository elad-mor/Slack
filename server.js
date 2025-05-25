require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Your bot token from environment
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

app.use(bodyParser.json());

// Endpoint Slack will post to
app.post('/slack/events', async (req, res) => {
  console.log('Slack event received:', req.body); // ✅ Debug log

  const { type, challenge, event } = req.body;

  // Handle Slack verification challenge
  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  // When bot is mentioned
  if (type === 'event_callback' && event.type === 'app_mention') {
    console.log('Bot was mentioned!'); // ✅ Debug log

    const message = `👋 Hello <@${event.user}>! I saw your mention.`;

    try {
      await axios.post(
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
      console.log('✅ Reply sent to Slack!');
    } catch (error) {
      console.error('❌ Error sending message to Slack:', error.response?.data || error.message);
    }
  }

  // Respond to Slack immediately
  res.status(200).send('OK');
});

// Serve static frontend if needed
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
