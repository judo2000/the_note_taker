const express = require('express');
const path = require('path');
const notes = require('./db/db.json');
const fs = require('fs');

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

app.listen(PORT, () =>
    console.log(`Listening at http://localhost:${PORT}!`)
);
