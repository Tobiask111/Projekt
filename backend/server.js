import initSqlJs from 'sql.js';
import fs from 'fs';

console.log('Initialising database...');
const SQL = await initSqlJs();
const db = new SQL.Database(fs.readFileSync('backend/music.sqlite'));
const dbResult = db.exec('select current_timestamp');
console.log('Database ready', dbResult[0].values[0][0]);

import express from 'express';

console.log('Initialising webserver...');
const port = 3001;
const server = express();
server.use(express.static('frontend'));
server.use(onEachRequest)
server.get('/api/test/', onGetTest);
server.listen(port, onServerReady);

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

function onServerReady() {
    console.log('Webserver running on port', port);
}
