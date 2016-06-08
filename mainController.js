'use strict';
let path   = require('path');
let crypto = require('crypto');

let passwords = {};
let key = String(Math.random()); // used for encryption and decryption

function encrypt(text){
  let cipher = crypto.createCipher('aes-256-cbc',key);
  let crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  let decipher = crypto.createDecipher('aes-256-cbc',key);
  let dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports.index = (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
};

module.exports.create = (req, res) => {
  return crypto.randomBytes(48, (err, buffer) => {
    let token = buffer.toString('hex');
    passwords[token] = encrypt(req.body.message);

    let protocol;
    if(process.env.NODE_ENV === 'production') {
      protocol = 'https';
    } else {
      protocol = 'http';
    }

    return res.send(`You can share your secret with this link (It will only work once):<br/>${protocol}://${req.get('host')}/${token}<br/><br/><a href="/">Go home</a>`);
  });
};

module.exports.show = (req, res) => {
  // Prevent script injection
  res.setHeader('content-type', 'text/plain');

  let key = req.originalUrl.replace('/','');
  let x;

  if(passwords[key]) {
    x = decrypt(passwords[key]);
    passwords[key] = undefined;
  }

  return res.send(`${x}`);
};
