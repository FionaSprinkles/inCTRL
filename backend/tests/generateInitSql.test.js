const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const {
    escapeSql,
    generateCategoriesSql,
    generateShortcutsSql,
    getUpdatedInitSql,
    CATEGORIES_START_TAG,
    CATEGORIES_END_TAG,
    SHORTCUTS_START_TAG,
    SHORTCUTS_END_TAG
} = require('../scripts/generateInitSql');

describe('backend/scripts/generateInitSql', () => {
    describe('escapeSql', () => {
        it('returns NULL for null or undefined', () => {
            assert.strictEqual(escapeSql(null), 'NULL');
            assert.strictEqual(escapeSql(undefined), 'NULL');
        });

        it('escapes single quotes by doubling them', () => {
            assert.strictEqual(escapeSql("don't"), "'don''t'");
            assert.strictEqual(escapeSql("hello 'world'"), "'hello ''world'''");
        });

        it('wraps normal strings in quotes', () => {
            assert.strictEqual(escapeSql("Ctrl + C"), "'Ctrl + C'");
        });
    });

    describe('generateCategoriesSql', () => {
        it('formats category objects into SQL INSERT IGNORE statement', () => {
            const sampleCategories = [
                { id: 1, name: "Cat's 1", slug: "cat-1", description: "Desc 1", icon: "icon-1", display_order: 1 }
            ];
            const sql = generateCategoriesSql(sampleCategories);
            assert.ok(sql.startsWith('INSERT IGNORE INTO categories (id, name, slug, description, icon, display_order) VALUES'));
            assert.ok(sql.includes("(1, 'Cat''s 1', 'cat-1', 'Desc 1', 'icon-1', 1);"));
        });
    });

    describe('generateShortcutsSql', () => {
        it('formats shortcut objects into SQL INSERT IGNORE statement', () => {
            const sampleShortcuts = [
                { id: 1, title: "Title 'A'", key_combo: "Ctrl + A", description: "Desc 'A'", category_id: 1, difficulty: "Beginner" }
            ];
            const sql = generateShortcutsSql(sampleShortcuts);
            assert.ok(sql.startsWith('INSERT IGNORE INTO windows_shortcuts (id, title, key_combo, description, category_id, difficulty) VALUES'));
            assert.ok(sql.includes("(1, 'Title ''A''', 'Ctrl + A', 'Desc ''A''', 1, 'Beginner');"));
        });
    });

    describe('getUpdatedInitSql synchronization', () => {
        it('confirms docker/init.sql is currently in sync with JSON seed data', () => {
            const { isSynced } = getUpdatedInitSql();
            assert.strictEqual(
                isSynced,
                true,
                'docker/init.sql is out of sync with JSON seed files! Run "npm run generate:sql" to fix.'
            );
        });

        it('throws an error if required markers are missing', () => {
            const tempSql = path.resolve(__dirname, 'temp_missing_markers.sql');
            fs.writeFileSync(tempSql, 'CREATE TABLE test (id INT);', 'utf8');

            try {
                assert.throws(() => {
                    getUpdatedInitSql({ initSqlPath: tempSql });
                }, /Could not find markers/);
            } finally {
                if (fs.existsSync(tempSql)) fs.unlinkSync(tempSql);
            }
        });

        it('detects out-of-sync content when markers contain outdated values', () => {
            const tempSql = path.resolve(__dirname, 'temp_outdated.sql');
            const content = `${CATEGORIES_START_TAG}\nOLD_CONTENT\n${CATEGORIES_END_TAG}\n${SHORTCUTS_START_TAG}\nOLD_SHORTCUTS\n${SHORTCUTS_END_TAG}`;
            fs.writeFileSync(tempSql, content, 'utf8');

            try {
                const { isSynced, updated } = getUpdatedInitSql({ initSqlPath: tempSql });
                assert.strictEqual(isSynced, false);
                assert.ok(updated.includes('INSERT IGNORE INTO categories'));
                assert.ok(updated.includes('INSERT IGNORE INTO windows_shortcuts'));
            } finally {
                if (fs.existsSync(tempSql)) fs.unlinkSync(tempSql);
            }
        });
    });
});
