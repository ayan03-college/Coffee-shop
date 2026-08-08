const express = require('express');
const router = express.Router();
const { chatWithBarista, chatWithBaristaStream } = require('../controllers/aiController');

router.post('/barista', chatWithBarista);
router.post('/barista/stream', chatWithBaristaStream);

module.exports = router;
