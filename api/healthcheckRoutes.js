const express = require('express');
const pool = require('./database');

const router = express.Router();

router.get('/', async (req, res) => {
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

module.exports = router;
