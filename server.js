const express = require('express');
const mysql = require('mysql2');
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// connect to the database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'pass1234',
        database: 'election'
    },
    console.log('Connected to the election database.')
);

// get all candidates
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT * FROM candidates`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            massage: 'success',
            data: rows
        });
    });
});

//get a single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT * FROM candidates WHERE id = ?`;
    const params = [req.params.id]; // this is where we'll get id to replace ? placeholder

    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json( { error: err.message }) // an obj with error
            return; // stop the function
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            req.statusMessage(400).json({ error: res.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found.'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// create a candidate
app.post('/api/candidate', ({ body }, res) => { // use destructuring to pull out body prop from req obj
    // use our validation ulit (takes obj and ...props as arguments)
    // always validate before sending to db!! keep your db clean of erroneous data! (and save moeny nothing free)
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    // error free? continue to the db!
    const sql = `INSERT INTO candidates ( first_name, last_name, industry_connected) VALUES (?,?,?)`
    const params = [body.first_name, body.last_name, body.industry_connected]; // don't need id bc sql will auto_increment for us
    
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });
});

// default response for any other request
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});