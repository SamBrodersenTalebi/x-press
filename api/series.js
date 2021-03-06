//import express and create instance of express router
const express = require('express');
const seriesRouter = express.Router();
const issuesRouter = require('./issues.js')

//import sqlite3
const sqlite3 = require('sqlite3');

//check if process.env.TEST_DATABASE has been set, and if so load that database instead
//it will be used for testing
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//Router param for handling the seriesId parameter
seriesRouter.param('seriesId', (req, res, next, seriesId)=>{
    const sql = "SELECT * FROM Series WHERE Series.id = $seriesId";
    const values = {$seriesId: seriesId};
    db.get(sql, values, (error, row)=>{
        if(error){
            next(error);
        } else if(row){
            //attach to request object as series
            req.series = row;
            next();
        } else{
            res.sendStatus(404);
        }
    })
});

//Mount issuesRouter at /:seriesId/issues
seriesRouter.use('/:seriesId/issues', issuesRouter);


//get handler at /
seriesRouter.get('/', (req, res, next)=>{
    const sql = "SELECT * FROM Series";
    db.all(sql, (error, rows)=>{
        if(error){
            next(error);
        }else{
            res.status(200).json({series:rows});
        }
    })
});

//get handler /:seriesId
seriesRouter.get('/:seriesId', (req, res, next)=>{
    //the router param handles error handling and receives the series at req.series
    res.status(200).json({series: req.series});
});

//post handler at /
seriesRouter.post('/', (req, res, next)=>{
    const name = req.body.series.name;
    const description = req.body.series.description;

    //check if they are present
    if(!name || !description){
        return res.send(400);
    }

    const sql = "INSERT INTO Series(name, description) VALUES($name, $description)";
    const values = {$name: name, $description: description};

    //insert into series table
    db.run(sql, values, function(error){
        //if there was an error then pass it to errorhandler
        if(error){
            next(error);
        }else{
            //select newly created row with this.lastId
            db.get(`SELECT * FROM Series Where Series.id = ${this.lastID}`, (error, row)=>{
                //send it in the response body with 201 status code
                res.status(201).json({series:row});
            })
        }
    })
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    //check if they are present
    if(!name || !description){
        return res.send(400);
    }

    const sql = "UPDATE Series SET name = $name, description = $description";
    const values = {$name: name, $description: description};
    db.run(sql, values, function(error){
        if(error){
            next(error);
        }else{
            //req.param is an object containing parameter values parsed from the URL path
            db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`,(error, row)=>{
                res.status(200).json({series:row});
            })
        }
    })
});

//delete handler 

seriesRouter.delete('/:seriesId', (req, res, next)=>{

    //This route should check to ensure the specified series has no related issues in the database
    const issueSql = "SELECT * FROM Issue WHERE Issue.series_id = $seriesId";
    const value = {$seriesId: req.params.seriesId};

    db.get(issueSql, value, (error,row)=>{
        if(error){
            next(error);
        }else if(row){
            return res.sendStatus(400);
        }else{
            const sql = `DELETE FROM Series WHERE Series.id = ${req.params.seriesId}`;
            db.run(sql, function(error){
                res.sendStatus(204);
            })
        }
    })
})

//export router 
module.exports = seriesRouter;