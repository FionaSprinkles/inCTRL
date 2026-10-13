require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../connectionMySQL');
const categories = require('../data/categoriesSeed.json');
const shortcuts = require('../data/windowsShortcutsSeed.json');

/**
 * Seeds or updates the database with categories and Windows shortcuts.
 */
async function seedDatabase() {
    console.log('🌱 Starting database seed process...');

    return new Promise((resolve, reject) => {
        // 1. Seed categories
        console.log(`📦 Seeding ${categories.length} categories...`);
        let pendingCategories = categories.length;

        categories.forEach(cat => {
            const sqlCat = `
                INSERT INTO categories (id, name, slug, description, icon, display_order)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    slug = VALUES(slug),
                    description = VALUES(description),
                    icon = VALUES(icon),
                    display_order = VALUES(display_order)
            `;
            db.query(sqlCat, [cat.id, cat.name, cat.slug, cat.description, cat.icon, cat.display_order], (err) => {
                if (err) {
                    console.error(`❌ Failed to seed category ${cat.name}:`, err.message);
                    return reject(err);
                }
                pendingCategories--;
                if (pendingCategories === 0) {
                    console.log('✅ Categories successfully seeded/updated.');

                    // 2. Seed shortcuts
                    console.log(`📦 Seeding ${shortcuts.length} shortcuts...`);
                    let pendingShortcuts = shortcuts.length;

                    shortcuts.forEach(s => {
                        const sqlShortcut = `
                            INSERT INTO windows_shortcuts (id, title, key_combo, description, category_id, difficulty)
                            VALUES (?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                title = VALUES(title),
                                key_combo = VALUES(key_combo),
                                description = VALUES(description),
                                category_id = VALUES(category_id),
                                difficulty = VALUES(difficulty)
                        `;
                        db.query(sqlShortcut, [s.id, s.title, s.key_combo, s.description, s.category_id, s.difficulty], (sErr) => {
                            if (sErr) {
                                console.error(`❌ Failed to seed shortcut ${s.title}:`, sErr.message);
                                return reject(sErr);
                            }
                            pendingShortcuts--;
                            if (pendingShortcuts === 0) {
                                console.log('✅ All Windows shortcuts successfully seeded/updated.');
                                resolve();
                            }
                        });
                    });
                }
            });
        });
    });
}

if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('🎉 Database seeding complete!');
            process.exit(0);
        })
        .catch(err => {
            console.error('💥 Database seeding failed:', err);
            process.exit(1);
        });
}

module.exports = { seedDatabase };
