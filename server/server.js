const http = require('http');
const app = require('./src/app');
const { init: initSocket } = require('./src/sockets');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));