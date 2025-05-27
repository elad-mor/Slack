const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { type, challenge } = req.body;

  if (type === 'url_verification') {
    return res.status(200).send(challenge);
  }

  res.status(200).send('OK');
});

module.exports = router;
