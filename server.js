const express = require("express");
const path = require("path");
const notes = require("./db/db.json");
const fs = require("fs");
const util = require("util");

const PORT = process.env.port || 3001;
const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// API/Notes route
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

// POST Route
// API/Notes post route to write new notes
app.post("/api/notes", (req, res) => {
  // set new note to the body of the post request
  const newNote = req.body;

  // Check to see if there are any other notes
  // if there are no other notes, set the new note id to 1
  // if there are notes get the length of the notes object
  // and set the id to notes.length + 1
  if (notes.length === 0) {
    newNote.id = 1;
  } else {
    newNote.id = notes[notes.length - 1].id + 1;
  }

  // push new note to notes array
  notes.push(newNote);
  // call writeNotes function and pass in notes
  writeNotes(notes);
  // End the respons process
  res.end();
});

// DELETE Route
// api/notes delete route, to delete notes.
app.delete("/api/notes/:id", (req, res) => {
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
  // Call the writeNotes function passing in newNotes to write the
  //newNotes to the db.json file
  writeNotes(newNotes);

  // End the respons process
  res.end();
});

// function to write notes to the db.json file
function writeNotes(newNotes) {
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
}

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}!`));
