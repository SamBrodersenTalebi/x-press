//import express and create instance of express router
const express = require('express');
const artistsRouter = express.Router();
//import sqlite3
const sqlite3 = require('sqlite3');

//check if process.env.TEST_DATABASE has been set, and if so load that database instead
//it will be used for testing
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//add router param
artistsRouter.param('artistId', (req, res, next, artistId)=>{
    db.get('SELECT * FROM Artist WHERE Artist.id=$artistId',
    {
        $artistId:artistId
    },(error, artist)=>{
        if(error){
            next(error)
        }else if(artits){
            //attach to request object as artist
            req.artist = artist;
            //move on to next function 
            next();
        } else{
            res.sendStatus(404);
        }
    })
});


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


//add get handler for 'api/artist/:artistId
artistsRouter.get(':artistId', (req, res, next)=>{
    //the router param handles error handling and receives the artist at req.artist
    res.status(200).json({artist: req.artist});
})

module.exports = artistsRouter;