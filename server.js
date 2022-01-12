const express = require("express");
const path = require("path");
const notes = require("./db/db.json");
const fs = require("fs");
const util = require("util");

const PORT = process.env.port || 80;
const app = express();

// Helper method for generating unique ids
const uuid = require("./helpers/uuid");
const { json } = require("express");

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// server static pages
app.use(express.static("public"));

// routes
// GET routes
// Root Route
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/public/")));

// Notes Route
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "public/notes.html"))
);

// API Routes
// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

// API/Notes route
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

// POST Route
// API/Notes post route to write new notes
app.post("/api/notes", (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    readAndAppend(newNote, "./db/db.json");
    res.json(`Note added successfully`);
  } else {
    res.error("Error in adding note");
  }
});

// DELETE Route
// api/notes delete route, to delete notes.
app.delete("/api/notes/:id", (req, res) => {
  console.info(`${req.method} request received for a note`);
  // get the note id from the query params
  const noteId = req.params.id;

  // create empty newNotes array
  let newNotes = [];

  // iterate through notes to check each note for the id of the
  // note to be deleted.
  for (const key in notes) {
    // check to see if there is a note at the current position (key)
    if (notes.hasOwnProperty(key)) {
      // check to see if the id of the current object is not equal
      // to the noteId.  If it is not equal push it to the newNotes array
      if (notes[key].id !== Number(noteId)) {
        newNotes.push(notes[key]);
      }
    }
  }
  // The newNotes array contains every object except the object that
  // the user is deleting.
  // Write the newNotes to the db.json file
  fs.writeFile("./db/db.json", JSON.stringify(newNotes), (err) => {
    // if there is an error
    if (err) {
      console.log(err);
      return;
      // when the not file has been written
    } else {
      console.log("Your notes has been updated!");
    }
  });

  // End the respons process
  res.send();
});

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}!`));
