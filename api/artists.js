//import express and create instance of express router
const express = require('express');
const artistsRouter = express.Router();
//import sqlite3
const sqlite3 = require('sqlite3');

//check if process.env.TEST_DATABASE has been set, and if so load that database instead
//it will be used for testing
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//add get handler 
artistsRouter.get('/', (req, res, next)=>{
    //db.all callback function takes two parameters 
    db.all(`SELECT * FROM Artist WHERE Artist.is_currently_employed = 1`,
    (err, rows)=>{
        //check if there is an error
        if(err){
            //pass it to the next middleware function which is the errorhandler
            next(err);
        }else{
            // res.json() Sends a JSON response composed of the specified data.
            res.status(200).json({artists:rows});
        }
    });
});

module.exports = artistsRouter;