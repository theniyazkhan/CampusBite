// Script to link images to menu items
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function linkImagesToMenuItems() {
  try {
    // First, ensure image_url column exists
    try {
      await db.query('ALTER TABLE menu_items ADD COLUMN image_url VARCHAR(500)');
      console.log('✓ Added image_url column to menu_items table');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ image_url column already exists');
      } else {
        throw err;
      }
    }

    const uploadsDir = path.join(__dirname, 'uploads/images');

    // Read all image files
    const imageFiles = fs.readdirSync(uploadsDir).filter(file =>
      /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} images to process...`);

    for (const imageFile of imageFiles) {
      // Extract the food name from filename (remove extension)
      const foodName = path.parse(imageFile).name;
      const imageUrl = `/uploads/images/${imageFile}`;

      try {
        // Update menu item with matching name - use full backend URL
        const fullImageUrl = `http://localhost:5000${imageUrl}`;
        const [result] = await db.query(
          'UPDATE menu_items SET image_url = ? WHERE name = ?',
          [fullImageUrl, foodName]
        );

        if (result.affectedRows > 0) {
          console.log(`✓ Linked ${foodName} to ${imageFile}`);
        } else {
          console.log(`⚠ No menu item found for: ${foodName}`);
        }
      } catch (err) {
        console.error(`✗ Error updating ${foodName}:`, err.message);
      }
    }

    console.log('\nDone! Image linking complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

linkImagesToMenuItems();
