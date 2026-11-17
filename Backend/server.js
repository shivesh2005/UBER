
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectToDB = require('./db/db');

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectToDB();

        http.createServer(app).listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();
