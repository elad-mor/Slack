const express = require('express');
const axios = require('axios');
const { getModalDefinition } = require('../utils/modal');
const { getUserEmail } = require('../utils/slack');

const router = express.Router();

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const FRESHSERVICE_DOMAIN = process.env.FRESHSERVICE_DOMAIN;
const FRESHSERVICE_API_KEY = process.env.FRESHSERVICE_API_KEY;

async function fetchDepartments() {
  const authHeader = {
    Authorization: 'Basic ' + Buffer.from(`${FRESHSERVICE_API_KEY}:X`).toString('base64')
  };

  try {
    const res = await axios.get(
      `https://${FRESHSERVICE_DOMAIN}/api/v2/departments`,
      { headers: authHeader }
    );

    return res.data.departments.map(dept => ({
      text: { type: 'plain_text', text: dept.name, emoji: true },
      value: String(dept.id)
    }));
  } catch (err) {
    console.error('❌ Failed to fetch departments:', err.message);
    return [];
  }
}

router.post('/', express.urlencoded({ extended: true }), async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  if (payload.type === 'message_action' && payload.callback_id === 'create_ticket') {
    const trigger_id = payload.trigger_id;
    const userId = payload.user.id;
    const messageText = payload.message.text;

    const userEmail = await getUserEmail(userId);
    const departmentOptions = await fetchDepartments();

    try {
      await axios.post(
        'https://slack.com/api/views.open',
        {
          trigger_id,
          view: getModalDefinition(userEmail, messageText, departmentOptions)
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
      console.error('❌ Slack API error:', error.response?.data || error.message);
    }

    return res.status(200).send();
  }

  if (payload.type === 'view_submission') {
    const values = payload.view.state.values;

    const email = values.emailarea['plain_text_input-action'].value;
    const description = values.descarea['plain_text_input-action'].value;
    const groupId = values.grouparea['static_select-action'].selected_option.value;

    const authHeader = {
      Authorization: 'Basic ' + Buffer.from(`${FRESHSERVICE_API_KEY}:X`).toString('base64'),
      'Content-Type': 'application/json'
    };

    try {
      const result = await axios.post(
        `https://${FRESHSERVICE_DOMAIN}/api/v2/assets`,
        {
          asset_type_id: 27000142300, // ← Replace with a valid asset type ID
          name: `Slack Request from ${email}`,
          description,
          department_id: groupId,
          custom_fields: { email, description }
        },
        { headers: authHeader }
      );

      console.log('✅ Freshservice asset created');

      await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: payload.user.id,
          text: `✅ Created asset for: ${email}\nGroup: ${groupId}`
        },
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err) {
      console.error('❌ Freshservice error:', err.response?.data || err.message);
    }

    return res.status(200).json({ response_action: 'clear' });
  }

  res.status(200).send();
});

module.exports = router;
