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
    const sql = 'SELECT * FROM Artist WHERE Artist.id=$artistId';
    const values = {$artistId: artistId}
    db.get(sql, values, (error, artist)=>{
        if(error){
            next(error)
        } else if(artist){
            //attach to request object as artist
            req.artist = artist;
            //move on to next function 
            next();
        } else{
            res.sendStatus(404);
        }
    });
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


//add get handler at 'api/artist/:artistId
artistsRouter.get('/:artistId', (req, res, next) => {
    //the router param handles error handling and receives the artist at req.artist
    res.status(200).json({artist: req.artist});
});

//add post handler at /
artistsRouter.post('/', (req, res, next)=>{
    //select fields from artist object
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;

    //check if is currently employed is set to 1 if not do it!
    //Use ternary operator
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    //check if they are present
    if(!name || !dateOfBirth || !biography){
       return res.send(400);
    }

    const sql = 'INSERT INTO Artist(name, date_of_birth, biography, is_currently_employed) VALUES($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
    const objectValues = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    };

    //Insert a new artist 
    db.run(sql, objectValues, function(error){
        //if there was an error then pass it to errorhandler
        if(error){
            next(error);
        } else {
        //otherwise select the newly created artist using lastID
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`, (error, row)=>{
                //send it in the response body with 201 status code
                res.status(201).json({artist:row});
            });
        }
    });

});

//put handler at /:artistId
artistsRouter.put('/:artistId', (req, res, next)=>{
       //select fields from artist object
       const name = req.body.artist.name;
       const dateOfBirth = req.body.artist.dateOfBirth;
       const biography = req.body.artist.biography;
   
       //check if is currently employed is set to 1 if not do it!
       //Use ternary operator
       const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
   
       //check if they are present
       if(!name || !dateOfBirth || !biography){
          return res.send(400);
       }

       //use UPDATE to update Artist table with the given id from the req.param.artistId
       const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';
       const objectValues = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $artistId: req.params.artistId
    };
    
       db.run(sql, objectValues, function(error){
           if(error){
               next(error);
           }else{
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
            (error, row) => {
                //send the updated artist with status code of 200
              res.status(200).json({artist: row});
            });
           }
       });
});

/*delete handler, however insted of actually deleting a row we will update the is_currently employed values to 0 meaning the person is unemployed */ 
artistsRouter.delete('/:artistId', (req, res, next)=>{
    //use UPDATE to update Artist table with the given id from the req.param.artistId
    const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId';
    const objectValues = {$artistId: req.params.artistId};

    db.run(sql, objectValues, (error)=>{
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
            (error, row) => {
              //send the updated artist with status code of 200
              res.status(200).json({artist: row});
            });
        }
    })

})

module.exports = artistsRouter;