const express = require('express');
const mariadb = require('mariadb');

require('dotenv').config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 5
});

const app = express();
const port = process.env.PORT || 82;

app.get('/healthcheck', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const status = conn.isValid() ? 'alive' : 'dead';
        res.json({
            status: 'success',
            data: {
                dbStatus: status
            }
        });
    } catch (err) {
        console.log(err);
        res.json({
            status: 'fail',
            data: {
                dbStatus: 'dead'
            }
        });
    } finally {
        if (conn) conn.end();
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
