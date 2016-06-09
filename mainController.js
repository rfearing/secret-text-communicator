'use strict';
let path   = require('path');
let crypto = require('crypto');
let nacl = require('ecma-nacl');
let key = new Buffer(crypto.randomBytes(32));

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
  res.sendFile(path.join(__dirname+'/index.html'));
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
    return res.render(path.join(__dirname, 'view.ejs'), {
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
  let nonce = new Buffer(crypto.randomBytes(24));

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

  // Dirty.. I know
  return res.send(`You can share your secret with this link (It will only work once):<br/><br/>${protocol}://${req.get('host')}/view?token=${token}&nonce=${nonce}<br/><br/><a href="/">Go home</a>`);
};

module.exports.show = (req, res) => {
  // Prevent script injection
  res.setHeader('content-type', 'text/plain');

  // Lazy way to get just the token part of the URL
  let token = req.originalUrl.replace('/','').split('?')[0];
  let nonce = req.query.nonce;

  if(passwords[token]) {
    // Decrypt the password using the nonce from the URL
    let x = nacl.secret_box.open(passwords[token], new Buffer(nonce), key);

    // Clear the entry
    passwords[token] = undefined;
    return res.send(`${x}`);
  } else {
    return res.send('Nothing to see here');
  }

};
