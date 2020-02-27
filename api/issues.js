//import express and create instance of express router
const express = require('express');
//Need access about specified series from issue router => need to merge paramters 
//Want to be able to access seriesId paramter
const issuesRouter = express.Router({mergeParams: true});


//import sqlite3
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


//get handler at /
issuesRouter.get('/', (req, res, next)=> {
    const sql = "SELECT * FROM Issues WHERE Issue.series_id = $seriesId";
    //have access to req.param.seriesId as we merged parameters.
    const values = {$seriesId: req.params.seriesId}
    db.all(sql, values, (error, rows)=>{
        if(error){
            next(error);
        }else{
            res.send(200).json({issues:rows});
        }
    })
});

//post handler at /
issuesRouter.post('/', (req, res, next)=>{
    //req.body contains paramters sent up from the user in a POST request
    const name = req.body.issue.name;
    const issueNumber =req.body.issue.issueNumber;
    const publicationDate =req.body.issue.publicationDate;
    const artistId =req.body.issue.artistId;
    const artistSql = "SELECT * FROM Artist WHERE Artist.id = $artistId";
    const artistValue = {$artistId: artistId};
    
    //need to make sure that the artistid exists
    db.get(artistSql, artistValue, (error, row)=>{
        if(error){
            next(error);
        } else{
            if(!name || !issueNumber || !publicationDate){
                return res.send(400);
            }
            const sql = "INSERT INTO Issue(name, issue_number, publication_date, artist_id, series_id) VALUES($name, $issueNumber, $publicationDate, $artistId, $seriesId)";
            const values = {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: row,
                $seriesId: req.params.seriesId
            };
            //run query
            db.run(sql, values, function(error){
                if(error){
                    next(error);
                }else{
                    //select created row with lastID
                    db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, (error, row)=>{
                        res.status(201).json({issue:row})
                    })
                }
            })
        }
    })
    
});

module.exports = issuesRouter;