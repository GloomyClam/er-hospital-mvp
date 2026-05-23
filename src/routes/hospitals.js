const express = require('express');
const { fetchSuyeongHospitals } = require('../services/emergencyApi');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await fetchSuyeongHospitals();
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch hospitals:', err.message);
    res.status(502).json({
      error: '병원 정보를 가져오지 못했습니다.',
      message: err.message,
    });
  }
});

module.exports = router;
