const path = require('path');
const dbPath = path.resolve(__dirname, '../../connectionMySQL.js');

let instance = null;

function getMockDb() {
    if (instance) return instance;

    let queryHandler = null;
    let connectionHandler = null;

    instance = {
        query: (sql, params, cb) => {
            const callback = typeof params === 'function' ? params : cb;
            const actualParams = typeof params === 'function' ? [] : params;
            if (queryHandler) {
                return queryHandler(sql, actualParams, callback);
            }
            callback(null, []);
        },
        getConnection: (cb) => {
            if (connectionHandler) {
                return connectionHandler(cb);
            }
            const mockConn = {
                beginTransaction: (bCb) => bCb(null),
                query: (sql, params, qCb) => {
                    const callback = typeof params === 'function' ? params : qCb;
                    const actualParams = typeof params === 'function' ? [] : params;
                    if (queryHandler) {
                        return queryHandler(sql, actualParams, callback);
                    }
                    callback(null, { insertId: 1 });
                },
                rollback: (rCb) => { if (rCb) rCb(); },
                commit: (cCb) => { if (cCb) cCb(null); },
                release: () => {}
            };
            cb(null, mockConn);
        },
        setQueryHandler: (fn) => { queryHandler = fn; },
        setConnectionHandler: (fn) => { connectionHandler = fn; },
        reset: () => {
            queryHandler = null;
            connectionHandler = null;
        }
    };

    require.cache[dbPath] = {
        id: dbPath,
        filename: dbPath,
        loaded: true,
        exports: instance
    };

    return instance;
}

module.exports = { getMockDb };
