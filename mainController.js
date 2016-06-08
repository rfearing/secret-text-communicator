'use strict';
let path = require('path');

let passwords = {};

module.exports.index = (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'));
};

module.exports.create = (req, res) => {
  return require('crypto').randomBytes(48, (err, buffer) => {
    let token = buffer.toString('hex');
    passwords[token] = req.body.message;

    let protocol;
    if(process.env.NODE_ENV='production') {
      protocol = 'https';
    } else {
      protocol = 'http';
    }

    return res.send(`You can share your secret with this link (It will only work once):<br/>${protocol}://${req.get('host')}/${token}<br/><br/><a href="/">Go home</a>`);
  });
};

module.exports.show = (req, res) => {
  let key = req.originalUrl.replace('/','');
  let x = passwords[key];
  passwords[key] = undefined;
  return res.send(`<pre>${x}</pre>`);
};
