const express = require('express');
const axios = require('axios');
const { getModalDefinition } = require('../utils/modal');
const { getUserEmail } = require('../utils/slack');

const router = express.Router();
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

router.post('/', express.urlencoded({ extended: true }), async (req, res) => {
  const payload = JSON.parse(req.body.payload);

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
      console.log('✅ Modal opened');
    } catch (error) {
      console.error('❌ Modal open error:', error.response?.data || error.message);
    }
  }

  res.status(200).send();
});

module.exports = router;
