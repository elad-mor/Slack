const express = require('express');
const axios = require('axios');
const { getModalDefinition } = require('../utils/modal');
const { getUserEmail } = require('../utils/slack');

const router = express.Router();
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const FRESHSERVICE_DOMAIN = process.env.FRESHSERVICE_DOMAIN;
const FRESHSERVICE_API_KEY = process.env.FRESHSERVICE_API_KEY;

router.post('/', express.urlencoded({ extended: true }), async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  // Message shortcut: open modal
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
      console.error('❌ Error opening modal:', error.response?.data || error.message);
    }

    return res.status(200).send();
  }

  // Modal submission: extract + post to Freshservice
  if (payload.type === 'view_submission') {
    const values = payload.view.state.values;

    const email = values.emailarea['plain_text_input-action'].value;
    const description = values.descarea['plain_text_input-action'].value;

    const authHeader = {
      Authorization: 'Basic ' + Buffer.from(`${FRESHSERVICE_API_KEY}:X`).toString('base64'),
      'Content-Type': 'application/json'
    };

    try {
      const assetPayload = {
        asset_type_id: 1234567890, // TODO: replace with your actual asset type ID
        name: `Slack Request from ${email}`,
        description: description,
        custom_fields: {
          email: email,
          description: description
        }
      };

      const result = await axios.post(
        `https://${FRESHSERVICE_DOMAIN}/api/v2/assets`,
        assetPayload,
        { headers: authHeader }
      );

      console.log('✅ Freshservice asset created:', result.data);
    } catch (error) {
      console.error('❌ Failed to create Freshservice asset:', error.response?.data || error.message);
    }

    return res.status(200).json({ response_action: 'clear' });
  }

  res.status(200).send();
});

module.exports = router;
