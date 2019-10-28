
const _DB_CACHE_POS_LOCAL = {
    user: 'mobile',
    password: 'rmKG9fnwW2rGxBsE',
    server: '171.244.51.123',
    database: 'Release_FB51_App_230919'
};

const sql = require('mssql');

sql.connect(_DB_CACHE_POS_LOCAL, err => {
    // ... error checks
    if (err) {
        console.log('ERROR_CHECK = ', err);
    } else {
        const request = new sql.Request();
        request.stream = true; // You can set streaming differently for each request
        request.query('select top 1 * from pos.Pawn order by Created desc'); // or request.execute(procedure)

        request.on('recordset', columns => {
            // Emitted once for each recordset in a query
            //console.log('recordset = ', columns);
        });

        request.on('row', row => {
            // Emitted for each row in a recordset
            console.log('row = ', row);
        });

        request.on('error', err => {
            // May be emitted multiple times
            console.log('error = ', error);
        });

        request.on('done', result => {
            // Always emitted as the last one
            console.log('done = ', result);
        });
    }
});

sql.on('error', err => {
    // ... error handler
    console.log('error handler = ', err);
});