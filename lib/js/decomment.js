const fs = require('fs');
const decomment = require('decomment');

fs.writeFileSync(
    `${__dirname}/backbone.1.4.1.js`,
    decomment(
        fs.readFileSync(`${__dirname}/backbone.1.4.1.annotated.js`).toString()
    )
);
