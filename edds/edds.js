const https = require('https')
const { parse: htmlParse } = require('node-html-parser')
const Buffer = require('buffer').Buffer

function parse (data) {
  return new Promise((resolve, reject) => {
    const root = htmlParse(data)
    const messageDiv = root.querySelector('.blue-text-block')
    if (messageDiv != null) {
      console.log(messageDiv.text.trim())
      resolve([messageDiv.text.trim()])
    } else {
      console.log("can't find a message text block")
      resolve([])
    }
  })
};

function download (url) {
  return new Promise((resolve, reject) => {
    https.get(url, function (res) {
      if (res.statusCode !== 200) {
        reject(new Error('error: download status code ' + res.statusCode))
      }

      const data = []
      res.on('data', function (chunk) {
        data.push(chunk)
      })

      res.on('end', function () {
        const buffer = Buffer.concat(data)
        resolve(buffer.toString().replace('&nbsp;', ' ').trim())
      })
    }).on('error', function (e) {
      reject(e)
    })
  })
};

function retrieveMessages () {
  return download('https://edds.gov74.ru/').then((data) => parse(data))
};

module.exports.download = download
module.exports.parse = parse
module.exports.retrieveMessages = retrieveMessages
