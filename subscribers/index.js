const db = require('../db');

create_sql = 'CREATE TABLE IF NOT EXISTS subscribers (user_id varchar(40) PRIMARY KEY)';

db.query(create_sql, (err, res) => {
    console.log(err, res);
});

module.exports = {
    add: (user_id) => {
        return new Promise((resolve, reject) => {
            db.query_pr('INSERT INTO subscribers values ($1)', [user_id])
                .then((res) => { console.log(res); resolve(res)})
                .catch((err) => { reject(err)})
        })
    },
    find_by_id: (user_id) => {
        return new Promise((resolve, reject) => {
            db.query_pr('SELECT * FROM subscribers where user_id=$1', [user_id])
            .then((res) => { console.log(res); resolve(res.rows)})
            .catch((err) => reject(err))
        })
    },
    find: () => {
        return new Promise((resolve, reject) => {
            db.query_pr('SELECT * FROM subscribers',)
            .then((res) => { console.log(res); resolve(res.rows)})
            .catch((err) => reject(err))
        })
    },
    delete: (user_id) => {
        return new Promise((resolve, reject) => {
            db.query_pr('DELETE FROM subscribers WHERE user_id=$1', [user_id])
                .then((res) => {console.log(res); resolve(res)})
        })
    }
}