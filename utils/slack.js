const axios = require('axios');
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

async function getUserEmail(userId) {
  try {
    const res = await axios.get(`https://slack.com/api/users.profile.get?user=${userId}`, {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`
      }
    });

    return res.data.profile.email || '';
  } catch (err) {
    console.error('❌ Failed to fetch user email:', err.message);
    return '';
  }
}

module.exports = { getUserEmail };
