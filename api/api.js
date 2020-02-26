//import express and create instance of express router
const express = require('express')
const apiRouter = express.Router()

//import artistsRouter
const artistsRouter = require('./artists');

//mount it at /artists
apiRouter.use('/artists', artistsRouter);

module.exports = apiRouter

