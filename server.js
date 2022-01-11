const express = require('express');
const path = require('path');
const notes = require('./db/db.json');
const fs = require('fs');
const util = require('util');

const PORT = process.env.port || 3001;
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// server static pages
app.use(express.static('public'));

// routes
// GET routes
// Root Route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/')))

// Notes Route
app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, 'public/notes.html'))
);

// API Routes
// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

// API/Notes route
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.listen(PORT, () =>
    console.log(`Listening at http://localhost:${PORT}!`)
);
