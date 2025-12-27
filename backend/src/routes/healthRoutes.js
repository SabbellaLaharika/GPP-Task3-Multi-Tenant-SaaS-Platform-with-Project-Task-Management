// healthRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).json({ 
      status: 'ok', 
      database: 'connected' 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected' 
    });
  }
});

module.exports = router;