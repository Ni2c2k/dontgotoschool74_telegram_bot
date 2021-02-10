var edds = require("./edds.js");
fs = require('fs')

// try {
//     const data = fs.readFileSync('out.html', 'utf8')
//     edds.parse(data).then((msgs) => {
//         console.log(msgs);
//     });
// } catch (err) {
//     console.log(err)
// }

edds.retrieveMessages().then((msgs) => {
    console.log(msgs);
}).catch((err) => {
    console.log(err);
});