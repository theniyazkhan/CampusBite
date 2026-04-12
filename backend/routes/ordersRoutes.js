const express = require('express');
const router = express.Router();
const { submitOrder, getOrders, getCompletedOrders, getOrdersByStudent, updateOrderStatus } = require('../controllers/ordersController');

router.post('/', submitOrder);
router.get('/', getOrders);
router.get('/completed', getCompletedOrders);
router.get('/:student_id', getOrdersByStudent);
router.post('/:order_id/status', updateOrderStatus);

module.exports = router;
