const db = require('../db')

const createSql = 'CREATE TABLE IF NOT EXISTS subscribers (user_id varchar(40) PRIMARY KEY)'

db.query(createSql, (err, res) => {
  console.log(err, res)
})

module.exports = {
  add: (userId) => {
    return new Promise((resolve, reject) => {
      db.query_pr('INSERT INTO subscribers values ($1)', [userId])
        .then((res) => { console.log(res); resolve(res) })
        .catch((err) => { reject(err) })
    })
  },
  find_by_id: (userId) => {
    return new Promise((resolve, reject) => {
      db.query_pr('SELECT * FROM subscribers where user_id=$1', [userId])
        .then((res) => { console.log(res); resolve(res.rows) })
        .catch((err) => reject(err))
    })
  },
  find: () => {
    return new Promise((resolve, reject) => {
      db.query_pr('SELECT * FROM subscribers')
        .then((res) => { console.log(res); resolve(res.rows) })
        .catch((err) => reject(err))
    })
  },
  delete: (userId) => {
    return new Promise((resolve, reject) => {
      db.query_pr('DELETE FROM subscribers WHERE user_id=$1', [userId])
        .then((res) => { console.log(res); resolve(res) })
    })
  }
}
