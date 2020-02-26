//import sqlite3 
const sqlite3 = require('sqlite3');

//open database.sqlite file as sqlite3 database object
const db = new sqlite3.Database('./database.sqlite');

//Create Arist table if it doesn't exist
db.serialize(()=>{
    db.run(`DROP TABLE IF EXISTS Artist`);
    db.run(`CREATE TABLE Artist(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        biography TEXT NOT NULL,
        is_currently_employed INTEGER DEFAULT 1
    )`);
})