// NEW
'use strict';
let fs = require('fs-extra');

let path = require('path');
let env  = process.env.NODE_ENV;
// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.
process.chdir(__dirname);

// Load dotenv if available
try {
  fs.statSync('.env');
  require('dotenv').config({silent: true});
} catch (err) {
}


//Allow the use of more es6 features within the node project, such as es6 imports, etc.
require('babel-register');

let express       = require('express');
let app           = express();
let bodyParser    = require('body-parser');
let morgan        = require('morgan');
let cors          = require('cors');
let mainController = require('./mainController');

//Enable all cors requests
app.use(cors());

app.set('view engine', 'ejs');

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(env === 'development') {
  // Log requests to the console
  app.use(morgan('dev'));
}

// Before filter for all requests
app.all('*', mainController.beforeFilter);

// Routes
app.get('/', mainController.index);
app.get('/view', mainController.view);
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname+'/robots.txt'));
});
app.get('*', mainController.show);
app.post('/new', mainController.create);

let port;

port = process.env.PORT || 8000;

let server = app.listen(port, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = server;
