var http = require("http");
var htmlparser = require("htmlparser2");
var Buffer = require('buffer').Buffer;
var Iconv = require('iconv').Iconv;

var iconv = new Iconv('cp1251','utf8');
var sectionOpened = false;
var messageStartFound = false;
var endFound = false;

var messages = [];

var parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
        if(name === "p" && attribs.class === "MsoNormal"){
          //console.log('MsoNormal open');
            sectionOpened = true;
            messageStartFound = true;
        }
    },
    onclosetag: function(tagname){
        if( tagname === "p" ) {
            if( sectionOpened === true ) {
              //console.log('close: sectionOpened = true');
                sectionOpened = false;
            }
        }
    },
    ontext: function(text) {
        if( /*sectionOpened === true*/ messageStartFound === true && endFound === false) {
          //console.log('sectionOpened: text:' + text + '!');
            if( text.indexOf("родители") != -1 ) {
                endFound = true;
            } else {
                messages.push(text);
            }
        }
    }
}, {decodeEntities: true});


function download(url, callback) {
    http.get(url, function(res) {

      console.log('download: status code: ' + res.statusCode);

        var data = [];
        res.on('data', function(chunk) {
            data.push(chunk);
        });
        res.on('end', function() {
            var buffer = Buffer.concat(data);
            callback( iconv.convert(buffer).toString().replace('&nbsp;', ' ').trim());
        });
    }).on('error', function(e) {
      console.log('download: ' + e);
        callback(null); st
    });
}

var url = "http://spas74.ru/school";

module.exports = {
    retrieveMessages: function( callback, errCallback ) {
        messages = [];
        endFound = false;
        messageStartFound = false;
        download(url, function(data) {
            if(data) {
                parser.write(data);
                parser.end();
                callback(messages);
            } else {
                errCallback();
            }
        });
    }
}
