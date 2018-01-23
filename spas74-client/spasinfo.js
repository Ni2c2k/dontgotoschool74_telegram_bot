var http = require("http");
var htmlparser = require("htmlparser2");
var Buffer = require('buffer').Buffer;
var Iconv = require('iconv').Iconv;

var iconv = new Iconv('cp1251','utf8');

function parse(data) {
  return new Promise((resolve, reject) => {

    var messages = [];
    var sectionOpened = false;
    var messageStartFound = false;
    var endFound = false;

    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            if(name === "b"){
              sectionOpened = true;
              messageStartFound = true;
            }
        },
        onclosetag: function(tagname){
            if( tagname === "b" ) {
                if( sectionOpened === true ) {
                  sectionOpened = false;
                }
            }
        },
        ontext: function(text) {
            if( messageStartFound === true && endFound === false) {
                endFound = true;
                messages.push(text);
            }
        },
        onend: function() {
          var outputMsgs = messages.filter( function( msg ) {
            if( msg === '\r\n\t' || msg === '\r\n\t\t' || msg === ' ' ){
              return false;
            }
            return true;
          });
          resolve(outputMsgs);
        },
        onerror: function(err) {
          reject(err);
        }
    }, {decodeEntities: true});

    parser.write(data);
    parser.end();
  });
};

function download(url){
  return new Promise((resolve,reject) =>{
    http.get(url, function(res){

      if(res.statusCode != 200) {
        reject('error: download status code ' + res.statusCode);
      }

      var data = [];
      res.on('data', function(chunk){
        data.push(chunk);
      });
      res.on('end', function(){
        var buffer = Buffer.concat(data);
        resolve (buffer.toString().replace('&nbsp;', ' ').trim());
      });
    }).on('error', function(e) {
      reject(e);
    });
  });
};

function retrieveMessages(){
  return download('http://edds74.ru/Upload/files/otmena.html').then((data) => parse(data));
};

module.exports.download = download;
module.exports.parse = parse;
module.exports.retrieveMessages = retrieveMessages;
