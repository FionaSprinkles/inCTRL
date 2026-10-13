const fs = require('fs');
const path = require('path');

const CATEGORIES_PATH = path.resolve(__dirname, '../data/categoriesSeed.json');
const SHORTCUTS_PATH = path.resolve(__dirname, '../data/windowsShortcutsSeed.json');
const INIT_SQL_PATH = path.resolve(__dirname, '../../docker/init.sql');

const CATEGORIES_START_TAG = '-- BEGIN AUTO-GENERATED: CATEGORIES';
const CATEGORIES_END_TAG = '-- END AUTO-GENERATED: CATEGORIES';
const SHORTCUTS_START_TAG = '-- BEGIN AUTO-GENERATED: WINDOWS SHORTCUTS';
const SHORTCUTS_END_TAG = '-- END AUTO-GENERATED: WINDOWS SHORTCUTS';

/**
 * Escapes a string for safe embedding in a SQL statement.
 */
function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
}

/**
 * Generates the INSERT statement for categories.
 */
function generateCategoriesSql(categories, lineEnding = '\n') {
    const rows = categories.map(c => 
        `(${c.id}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.icon)}, ${c.display_order})`
    ).join(`,${lineEnding}`);

    return `INSERT IGNORE INTO categories (id, name, slug, description, icon, display_order) VALUES${lineEnding}${rows};`;
}

/**
 * Generates the INSERT statement for windows shortcuts.
 */
function generateShortcutsSql(shortcuts, lineEnding = '\n') {
    const rows = shortcuts.map(s => 
        `(${s.id}, ${escapeSql(s.title)}, ${escapeSql(s.key_combo)}, ${escapeSql(s.description)}, ${s.category_id}, ${escapeSql(s.difficulty)})`
    ).join(`,${lineEnding}`);

    return `INSERT IGNORE INTO windows_shortcuts (id, title, key_combo, description, category_id, difficulty) VALUES${lineEnding}${rows};`;
}

/**
 * Builds the complete updated init.sql string with regenerated seed blocks.
 */
function getUpdatedInitSql(options = {}) {
    const initSqlPath = options.initSqlPath || INIT_SQL_PATH;
    const categoriesPath = options.categoriesPath || CATEGORIES_PATH;
    const shortcutsPath = options.shortcutsPath || SHORTCUTS_PATH;

    const rawSql = fs.readFileSync(initSqlPath, 'utf8');
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    const shortcuts = JSON.parse(fs.readFileSync(shortcutsPath, 'utf8'));

    const isCrlf = rawSql.includes('\r\n');
    const le = isCrlf ? '\r\n' : '\n';

    const catSql = generateCategoriesSql(categories, le);
    const scSql = generateShortcutsSql(shortcuts, le);

    // Replace categories block
    const catRegex = new RegExp(
        `(${CATEGORIES_START_TAG})[\\s\\S]*?(${CATEGORIES_END_TAG})`
    );
    if (!catRegex.test(rawSql)) {
        throw new Error(`Could not find markers: ${CATEGORIES_START_TAG} ... ${CATEGORIES_END_TAG}`);
    }
    let updated = rawSql.replace(catRegex, `$1${le}${catSql}${le}${CATEGORIES_END_TAG}`);

    // Replace shortcuts block
    const scRegex = new RegExp(
        `(${SHORTCUTS_START_TAG})[\\s\\S]*?(${SHORTCUTS_END_TAG})`
    );
    if (!scRegex.test(updated)) {
        throw new Error(`Could not find markers: ${SHORTCUTS_START_TAG} ... ${SHORTCUTS_END_TAG}`);
    }
    updated = updated.replace(scRegex, `$1${le}${scSql}${le}${SHORTCUTS_END_TAG}`);

    return {
        original: rawSql,
        updated,
        isSynced: rawSql === updated
    };
}

/**
 * CLI execution or programmatic sync
 */
function run(checkOnly = false) {
    const { original, updated, isSynced } = getUpdatedInitSql();

    if (checkOnly) {
        if (!isSynced) {
            console.error('❌ docker/init.sql is out of sync with JSON seed files.');
            console.error('👉 Run "npm run generate:sql" to synchronize docker/init.sql.');
            process.exit(1);
        }
        console.log('✅ docker/init.sql is up to date with JSON seed files.');
        process.exit(0);
    }

    if (isSynced) {
        console.log('✨ docker/init.sql is already up to date.');
        return;
    }

    fs.writeFileSync(INIT_SQL_PATH, updated, 'utf8');
    console.log('✅ Successfully updated docker/init.sql from JSON seed files.');
}

if (require.main === module) {
    const checkOnly = process.argv.includes('--check');
    run(checkOnly);
}

module.exports = {
    generateCategoriesSql,
    generateShortcutsSql,
    getUpdatedInitSql,
    escapeSql,
    CATEGORIES_START_TAG,
    CATEGORIES_END_TAG,
    SHORTCUTS_START_TAG,
    SHORTCUTS_END_TAG
};
