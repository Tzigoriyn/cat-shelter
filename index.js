const http = require('http');
const port = 3000;
const handlers = require('./handlers')


function requestHandler(req, res) {
    for (let handler of handlers) {
        if (!handler(req, res)) {
            break;
        }
    };
};


const app = http.createServer(requestHandler);

app.listen(port, () => console.log(`Server is listening on port ${port}...`));
