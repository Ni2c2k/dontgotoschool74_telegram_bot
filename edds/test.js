var edds = require("./edds.js");

edds.retrieveMessages().then((msgs) => {
    console.log(msgs);
}).catch((err) => {
    console.log(err);
});