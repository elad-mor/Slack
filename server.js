require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/slack/events', require('./routes/slackEvents'));
app.use('/slack/interact', require('./routes/slackInteractions'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
