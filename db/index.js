const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({
  connectionString,
})

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback)
    },
    query_pr: (text, params) => {
        return pool.query(text, params)
    }
}

// process.on('SIGINT', function() {
//     pool.end()
//     process.exit(0)
//   });