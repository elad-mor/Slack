const express = require('express');
const axios = require('axios');
const { getModalDefinition } = require('../utils/modal');
const { getUserEmail } = require('../utils/slack');
const { fetchDepartments } = require('../utils/freshservice');

const router = express.Router();
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const FRESHSERVICE_DOMAIN = process.env.FRESHSERVICE_DOMAIN;
const FRESHSERVICE_API_KEY = process.env.FRESHSERVICE_API_KEY;

router.post('/', express.urlencoded({ extended: true }), async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  // Handle Slack message shortcut to open modal
  if (payload.type === 'message_action' && payload.callback_id === 'create_ticket') {
    const trigger_id = payload.trigger_id;
    const messageText = payload.message.text;
    const userId = payload.user.id;

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

      console.log('✅ Modal opened from shortcut');
    } catch (error) {
      console.error('❌ Error opening modal:', error.response?.data || error.message);
    }

    return res.status(200).send();
  }

  // Handle Slack modal submission
  if (payload.type === 'view_submission') {
    console.log('\n📥 Modal submission triggered');

    const values = payload.view.state.values;

    const email = values.emailarea?.['plain_text_input-action']?.value;
    const description = values.descarea?.['plain_text_input-action']?.value;
    const groupId = values.grouparea?.['static_select-action']?.selected_option?.value;

    // Log the extracted values
    console.log('Email:', email);
    console.log('Description:', description);
    console.log('Group ID:', groupId);

    // Validate inputs
    if (!email || !description || !groupId) {
      console.warn('❌ Missing one or more required fields in modal submission.');
      return res.status(200).json({ response_action: 'errors', errors: {
        emailarea: 'Missing email',
        descarea: 'Missing description',
        grouparea: 'Missing group'
      }});
    }

    const authHeader = {
      Authorization: 'Basic ' + Buffer.from(`${FRESHSERVICE_API_KEY}:X`).toString('base64'),
      'Content-Type': 'application/json'
    };

    try {
      const assetPayload = {
        asset_type_id: 1234567890, // Replace with actual asset type ID from Freshservice
        name: `Slack Request from ${email}`,
        description,
        department_id: groupId,
        custom_fields: {
          email,
          description
        }
      };

      const result = await axios.post(
        `https://${FRESHSERVICE_DOMAIN}/api/v2/assets`,
        assetPayload,
        { headers: authHeader }
      );

      console.log('✅ Freshservice asset created:', result.data);

      await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: payload.user.id,
          text: `✅ Freshservice asset created!\n• *Email:* ${email}\n• *Group:* ${groupId}`
        },
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('❌ Freshservice API error:', error.response?.data || error.message);
    }

    return res.status(200).json({ response_action: 'clear' });
  }

  res.status(200).send();
});

module.exports = router;