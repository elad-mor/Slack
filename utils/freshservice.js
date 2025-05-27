const axios = require('axios');

const FRESHSERVICE_DOMAIN = process.env.FRESHSERVICE_DOMAIN;
const FRESHSERVICE_API_KEY = process.env.FRESHSERVICE_API_KEY;

const authHeader = {
  Authorization: 'Basic ' + Buffer.from(`${FRESHSERVICE_API_KEY}:X`).toString('base64')
};

async function fetchDepartments() {
  try {
    const res = await axios.get(
      `https://${FRESHSERVICE_DOMAIN}/api/v2/departments`,
      { headers: authHeader }
    );

    return res.data.departments.map(dept => ({
      text: {
        type: 'plain_text',
        text: dept.name,
        emoji: true
      },
      value: String(dept.id)
    }));
  } catch (err) {
    console.error('❌ Failed to fetch Freshservice departments:', err.message);
    return [];
  }
}

module.exports = { fetchDepartments };
