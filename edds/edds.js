const https = require("https");
const { parse: html_parse } = require('node-html-parser')
const Buffer = require('buffer').Buffer;

function parse(data) {
  return new Promise((resolve, reject) => {
    const root = html_parse(data);
    const message_div = root.querySelector('.blue-text-block');
    if (message_div != null) {
      console.log(message_div.text.trim());
      resolve([message_div.text.trim()])
    } else {
      console.log("can't find a message text block");
      resolve([]);
    }
  });
};

function download(url){
  return new Promise((resolve,reject) => {
    https.get(url, function(res) {

      if(res.statusCode != 200) {
        reject('error: download status code ' + res.statusCode);
      }

      let data = [];
      res.on('data', function(chunk){
        data.push(chunk);
      });

      res.on('end', function(){
        const buffer = Buffer.concat(data);
        resolve (buffer.toString().replace('&nbsp;', ' ').trim());
      });
    }).on('error', function(e) {
      reject(e);
    });
  });
};

function retrieveMessages(){
  return download('https://edds.gov74.ru/').then((data) => parse(data));
};

module.exports.download = download;
module.exports.parse = parse;
module.exports.retrieveMessages = retrieveMessages;
