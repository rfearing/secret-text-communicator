'use strict';
let path   = require('path');
let crypto = require('crypto');
let nacl = require('ecma-nacl');
let key = new Buffer(crypto.randomBytes(32));
let fs = require('fs');

let passwords = {};
let limits    = {};

module.exports.beforeFilter = (req, res, next) => {
  // Remove all keys that have expired.
  for(let token in passwords){
    // If the limit was a date in the past, expire it.
    if(limits[token] < Date.now()) {
      passwords[token] = undefined;
    }
  }

  //ENGAGE!
  next();
};

module.exports.index = (req, res) => {
  return res.render(path.join(__dirname, '../views/pages/index.ejs'), {});
};

// Renders an intermediary page for viewing the secret.
// This is to prevent software like slack from pre-loading
// the secret and burning it.
module.exports.view = (req, res) => {
  let token = req.query.token;
  let nonce = req.query.nonce;

  // Check if the URL exists first to prevent annoying UX
  if (passwords[token]) {
    //EJS should prevent XSS
    return res.render(path.join(__dirname, '../views/pages/view.ejs'), {
      token: token,
      nonce: nonce,
    });
  } else {
    return res.send('Nothing to see here');
  }
};

module.exports.create = (req, res) => {
  // Save the random token
  let token = crypto.randomBytes(48).toString('hex');

  // Create a random nonce
  let nonceString = crypto.randomBytes(24).toString('hex').substring(0,24);
  let nonce = new Buffer(nonceString);

  // Message as Buffer
  let message = new Buffer(req.body.message, 'utf-8');

  // Store the encrypted password in the array and the expiry time
  passwords[token] = nacl.secret_box.pack(message, nonce, key);
  limits[token] = Date.now() + (24*60*60*1000); // Expires in 7 days
  // Determine which protocol to use for the link
  let protocol;
  if(process.env.NODE_ENV === 'production') {
    protocol = 'https';
  } else {
    protocol = 'http';
  }

  return fs.writeFile('./number-of-passwords.txt', Object.keys(passwords).length, (err) => {
    if(err) {
      return console.log(err);
    }

    return res.render(path.join(__dirname, '../views/pages/create.ejs'), {
      token: token,
      protocol: protocol,
      host:req.get('host'),
      nonce: nonceString,
    });
  });
};

module.exports.show = (req, res) => {
  // Lazy way to get just the token part of the URL
  let token = req.originalUrl.replace('/','').split('?')[0];
  let nonce = req.query.nonce;

  if(passwords[token]) {
    // Decrypt the password using the nonce from the URL
    let x = nacl.secret_box.open(passwords[token], new Buffer(nonce), key);

    // Now just need to convert buffer back to string here. This may be glitchy
    x = decodeURIComponent(escape(String.fromCharCode.apply(null, x)));

    // Clear the entry
    delete passwords[token];
    delete limits[token];

    return fs.writeFile('./number-of-passwords.txt', Object.keys(passwords).length, (err) => {
      if(err) {
        return console.log(err);
      }

      return res.render(path.join(__dirname, '../views/pages/show.ejs'), {secret: x});
    });
  } else {
    return res.send('Nothing to see here');
  }

};
