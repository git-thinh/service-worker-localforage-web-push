
const _DB_CACHE_POS_LOCAL = {
    user: 'mobile',
    password: 'asdasd',
    server: 'adasd',
    database: 'asdasd'
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