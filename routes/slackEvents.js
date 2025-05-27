const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { type, challenge, event } = req.body;

  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  if (type === 'event_callback' && event.type === 'app_mention') {
    console.log('Bot was mentioned (optional handling here)');
  }

  res.status(200).send('OK');
});

module.exports = router;
