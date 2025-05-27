const express = require('express');
const axios = require('axios');
const { getModalDefinition } = require('../utils/modal');
const { getUserEmail } = require('../utils/slack');

const router = express.Router();
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

// Parse urlencoded Slack payload
router.post('/', express.urlencoded({ extended: true }), async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  // 👇 Handle message shortcut
  if (payload.type === 'message_action' && payload.callback_id === 'create_ticket') {
    const trigger_id = payload.trigger_id;
    const messageText = payload.message.text;
    const userId = payload.user.id;

    const userEmail = await getUserEmail(userId);

    try {
      await axios.post(
        'https://slack.com/api/views.open',
        {
          trigger_id,
          view: getModalDefinition(userEmail, messageText)
        },
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Modal open error:', error.response?.data || error.message);
    }

    return res.status(200).send(); // Always acknowledge
  }

  // 👇 Handle modal submission
  if (payload.type === 'view_submission') {
    const values = payload.view.state.values;

    const email = values.emailarea['plain_text_input-action'].value;
    const description = values.descarea['plain_text_input-action'].value;

    console.log('📥 Modal submission received:');
    console.log('Email:', email);
    console.log('Description:', description);

    // TODO: Send to your system (Freshservice, Airtable, etc.)

    // Optionally: send a message to user confirming receipt
    try {
      await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: payload.user.id,
          text: `✅ Ticket submitted!\n• *Email:* ${email}\n• *Description:* ${description}`
        },
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error sending confirmation:', error.response?.data || error.message);
    }

    return res.status(200).json({ response_action: "clear" });
  }

  // Default response
  res.status(200).send();
});

module.exports = router;
