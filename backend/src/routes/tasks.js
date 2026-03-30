const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'tasks routes ok' });
});

module.exports = router;