// import body-parser, cors, express, morgan, errorhandler:
const bodyParser = require('body-parser');
const morgan = require('morgan');
var cors = require('cors');
const express = require('express');
var morgan = require('morgan');
var errorhandler = require('errorhandler');

//create instance of express app:
const app = express();

//Variable representing PORT 
const PORT = process.env.PORT || 4000;

//Use body-parser JSON, errorhandler, morgan and CORS middleware functions:
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(cors());

//use errorhandler 
app.use(errorhandler());

//Start server on PORT:
app.listen(PORT, ()=>{
    console.log(`Server is listening at port ${PORT}`);
});

//Export app (for use in test file):
module.exports = app