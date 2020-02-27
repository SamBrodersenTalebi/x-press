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
})

module.exports = issuesRouter;