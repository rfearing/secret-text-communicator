// NEW
'use strict';
let fs = require('fs-extra');
require('express-force-ssl');

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

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(env === 'production') {
  app.set('forceSSLOptions', {
    enable301Redirects: true,
    trustXFPHeader: false,
    httpsPort: 443,
    sslRequiredMessage: 'SSL Required.',
  });
}

if(env === 'development') {
  // Log requests to the console
  app.use(morgan('dev'));
}

app.get('/', mainController.index);

app.post('/new', mainController.create);

app.get('*', mainController.show);

let port;

port = process.env.PORT || 8000;

let server = app.listen(port, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = server;
