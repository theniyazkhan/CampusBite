const db = require('../config/db');

const submitOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { student_id, items, pickup_time } = req.body;

    // --- Validation ---
    if (!student_id || !items || !pickup_time) {
      return res.status(400).json({ message: 'student_id, items, and pickup_time are required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items must be a non-empty array.' });
    }

    // --- Begin Transaction ---
    await connection.beginTransaction();

    // --- Fetch item prices and calculate total securely on the backend ---
    const itemIds = items.map(item => item.item_id);
    const [menuItems] = await connection.query(
      'SELECT item_id, price FROM menu_items WHERE item_id IN (?)',
      [itemIds]
    );
    
    // Create a map for quick price lookup
    const priceMap = new Map(menuItems.map(item => [item.item_id, parseFloat(item.price)]));

    let calculatedTotal = 0;
    for (const item of items) {
      const price = priceMap.get(item.item_id);
      if (price === undefined) {
        await connection.rollback(); // Rollback if any item is invalid
        return res.status(400).json({ message: `Invalid item_id: ${item.item_id}` });
      }
      calculatedTotal += price * item.quantity;
    }

    // --- Insert into 'orders' table ---
    const [orderResult] = await connection.query(
      'INSERT INTO orders (student_id, pickup_time, total_price, status) VALUES (?, ?, ?, ?)',
      [student_id, pickup_time, calculatedTotal, 'pending']
    );
    const orderId = orderResult.insertId;

    // --- Insert into 'order_items' table ---
    const orderItemsValues = items.map(item => [
      orderId,
      item.item_id,
      item.quantity,
      priceMap.get(item.item_id) // price_at_order
    ]);

    await connection.query(
      'INSERT INTO order_items (order_id, item_id, quantity, price_at_order) VALUES ?',
      [orderItemsValues]
    );

    // --- Commit Transaction ---
    await connection.commit();

    return res.status(201).json({ message: 'Order submitted successfully.', order_id: orderId });

  } catch (error) {
    if (connection) await connection.rollback(); // Rollback on any other error
    console.error('Submit order error:', error);

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Student not found. Please login first.' });
    }

    return res.status(500).json({ message: 'Server error while submitting order.' });
  } finally {
    if (connection) connection.release(); // Release connection back to the pool
  }
};

const getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.order_id, o.student_id, s.name, s.phone, o.pickup_time, o.total_price, o.status, o.created_at
      FROM orders o
      JOIN students s ON o.student_id = s.student_id
      WHERE o.status IN ('pending', 'ready')
      ORDER BY o.created_at DESC
    `);

    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    const orderIds = orders.map(o => o.order_id);
    const [items] = await db.query(`
      SELECT oi.order_id, oi.quantity, oi.price_at_order AS price, mi.name
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.item_id
      WHERE oi.order_id IN (?)
    `, [orderIds]);
    const itemsByOrderId = new Map();
    for (const item of items) {
      if (!itemsByOrderId.has(item.order_id)) itemsByOrderId.set(item.order_id, []);
      itemsByOrderId.get(item.order_id).push(item);
    }

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: itemsByOrderId.get(order.order_id) || []
    }));

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Server error while fetching orders.' });
  }
};

const getOrdersByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;

    const [orders] = await db.query(`
      SELECT order_id, student_id, pickup_time, total_price, status, created_at
      FROM orders
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [student_id]);

    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    const orderIds = orders.map(o => o.order_id);
    const [items] = await db.query(`
      SELECT oi.order_id, oi.quantity, oi.price_at_order AS price, mi.name
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.item_id
      WHERE oi.order_id IN (?)
    `, [orderIds]);
    const itemsByOrderId = new Map();
    for (const item of items) {
      if (!itemsByOrderId.has(item.order_id)) itemsByOrderId.set(item.order_id, []);
      itemsByOrderId.get(item.order_id).push(item);
    }

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: itemsByOrderId.get(order.order_id) || []
    }));

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error('Get student orders error:', error);
    return res.status(500).json({ message: 'Server error while fetching student orders.' });
  }
};

const getCompletedOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.order_id, o.student_id, s.name, s.phone, o.pickup_time, o.total_price, o.status, o.created_at
      FROM orders o
      JOIN students s ON o.student_id = s.student_id
      WHERE o.status = 'completed'
      ORDER BY o.created_at DESC
    `);

    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    const orderIds = orders.map(o => o.order_id);
    const [items] = await db.query(`
      SELECT oi.order_id, oi.quantity, oi.price_at_order AS price, mi.name
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.item_id
      WHERE oi.order_id IN (?)
    `, [orderIds]);
    const itemsByOrderId = new Map();
    for (const item of items) {
      if (!itemsByOrderId.has(item.order_id)) itemsByOrderId.set(item.order_id, []);
      itemsByOrderId.get(item.order_id).push(item);
    }

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: itemsByOrderId.get(order.order_id) || []
    }));

    res.status(200).json(ordersWithItems);
  } catch (error) {
    console.error('Get completed orders error:', error);
    return res.status(500).json({ message: 'Server error while fetching completed orders.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: pending, ready, completed, cancelled.' });
    }

    const [result] = await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, order_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({ message: `Order marked as ${status}.` });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error while updating order status.' });
  }
};

module.exports = { submitOrder, getOrders, getOrdersByStudent, getCompletedOrders, updateOrderStatus };
