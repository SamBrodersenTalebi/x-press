//import express and create instance of express router
const express = require('express')
const apiRouter = express.Router()

//import artistsRouter
const artistsRouter = require('./artists.js');

//import seriesRouter
const seriesRouter = require('./series.js');

//mount it at /artists
apiRouter.use('/artists', artistsRouter);
apiRouter.use('/series', seriesRouter)

module.exports = apiRouter

