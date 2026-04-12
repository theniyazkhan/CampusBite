const db = require('../config/db');

/**
 * Fetches all available menu items.
 */
const getMenu = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY item_id ASC'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ message: 'Server error while fetching menu.' });
  }
};

/**
 * Fetches the top 3 most sold menu items.
 */
const getMostSold = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT mi.*, sales.total_sold
      FROM menu_items mi
      JOIN (
        SELECT oi.item_id, SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status != 'cancelled'
        GROUP BY oi.item_id
      ) sales ON mi.item_id = sales.item_id
      WHERE mi.is_available = TRUE
      ORDER BY sales.total_sold DESC
      LIMIT 10
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get most sold items error:', error);
    return res.status(500).json({ message: 'Server error while fetching most sold items.' });
  }
};

module.exports = { getMenu, getMostSold };