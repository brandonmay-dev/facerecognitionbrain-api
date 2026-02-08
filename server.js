const http = require('http');

const server = http.createServer(() => {
    console.log('server is running');
}

server.listen(3000, () => {
    console.log('server is listening on port 3000');
}