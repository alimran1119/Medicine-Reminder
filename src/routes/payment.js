const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { items, method } = req.body;
  console.log('Order received:', items, 'Payment method:', method);
  res.json({ status: 'success', orderId: 'ORD' + Math.floor(Math.random() * 100000) });
});


module.exports = router;
