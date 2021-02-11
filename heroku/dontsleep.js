const http = require('http')

function preventSleepHeroku () {
  return new Promise((resolve, reject) => {
    http.get('http://dontgotoschool.herokuapp.com/', function (res) {
      res.on('data', function () {
      })
      res.on('end', function () {
        resolve('preventSleepHeroku ok')
      })
    }).on('error', function () {
      console.log('error')
      reject(new Error('error while preventSleepHeroku'))
    })
  })
};

module.exports.preventSleepHeroku = preventSleepHeroku
