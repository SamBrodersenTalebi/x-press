//import express and create instance of express router
const express = require('express');
//Need access about specified series from issue router => need to merge paramters 
//Want to be able to access seriesId paramter
const issuesRouter = express.Router({mergeParams: true});


//import sqlite3
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//router param for :issueId
//param checks to see if an issue was supplied with an issue ID 
issuesRouter.param('issueId', (req, res, next, issueId) => {
    const sql = 'SELECT * FROM Issue WHERE Issue.id = $issueId';
    const values = {$issueId: issueId};
    db.get(sql, values, (error, issue) => {
      if (error) {
        next(error);
      } else if (issue) {
        next();
      } else {
        res.sendStatus(404);
      }
    });
});

//get handler at /
issuesRouter.get('/', (req, res, next)=> {
    const sql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
    //have access to req.param.seriesId as we merged parameters.
    const values = { $seriesId: req.params.seriesId};
    db.all(sql, values, (error, issues) => {
        if (error) {
          next(error);
        } else {
          res.status(200).json({issues: issues});
        }
    });
});

//post handler at /
issuesRouter.post('/', (req, res, next)=>{
    //req.body contains paramters sent up from the user in a POST request
    const name = req.body.issue.name,
    issueNumber = req.body.issue.issueNumber,
    publicationDate = req.body.issue.publicationDate,
    artistId = req.body.issue.artistId;
    const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId';
    const artistValues = {$artistId: artistId};
    
    //need to make sure that the artistid exists
    db.get(artistSql, artistValues, (error, row)=>{
        if(error){
            next(error);
        } else{
            if(!name || !issueNumber || !publicationDate || !row){
                return res.sendStatus(400);
            }
            const sql = 'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)' +
            'VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';
            const values = {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
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

//put handler for :issueId
issuesRouter.put('/:issueId', (req, res, next)=>{
    //This route should return a 400 response if any required fields are missing
    const name = req.body.issue.name,
    issueNumber = req.body.issue.issueNumber,
    publicationDate = req.body.issue.publicationDate,
    artistId = req.body.issue.artistId;
    const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId';
    const artistValues = {$artistId: artistId};

    
    db.get(artistSql, artistValues, (error, row)=>{
        if(error){
            next(error);
        }else{
            if(!name || !issueNumber || !publicationDate || !row){
                return res.sendStatus(400);
            }

            const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, ' +
                'publication_date = $publicationDate, artist_id = $artistId ' +
                'WHERE Issue.id = $issueId';
            const values = {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $issueId: req.params.issueId
            };

            db.run(sql, values, function(error){
                if(error){
                    next(error);
                }else{
                    db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`,
                    (error, issue) => {
                      res.status(200).json({issue: issue});
                    });
                }
            })
        }
    })
});

issuesRouter.delete('/:issueId', (req, res, next)=>{
    const sql = `DELETE FROM Issue WHERE Issue.id = ${req.params.issueId}`;
    db.run(sql, function(error){
        if(error){
            next(error)
        }else{
            res.sendStatus(204);
        }
    })
});

module.exports = issuesRouter;