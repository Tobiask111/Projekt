import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // read .env file 
console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
}); //We connect to postgresql
const dbResult = await db.query('select now() as now'); //From line 14-15 we test the database connection and logs it
console.log('Database connection established on', dbResult.rows[0].now);

import express from 'express';
import { title } from 'process';

console.log('Initialising webserver...'); //From line 20-22 we start the web server and sets the port to 3001
const port = 3001;
const server = express();
server.use(express.static('frontend'));
server.use(onEachRequest)
server.get('/api/vigtig_handelpartnere', onGetVigtig_handelpartnere);
server.get('/api/onKaffe', onKaffe);
server.get('/api/onMaskiner', onMaskiner);
server.get('/api/onLevendeDyr', onLevendeDyr);
server.get('/api/onMedicin', onMedicin);
server.get('/api/onTobak', onTobak);
server.get('/api/totaleksport', onTotalEksport);
server.get('/api/totalImport', onTotalImport);
server.listen(port, onServerReady);


//This is an Express middleware function — it runs before any specific route handler.
//Logs the date, HTTP method (GET, POST, etc.), and requested URL to the terminal.
function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

//This is the callback for when the server is ready.
//It logs a message to the terminal, so you know the server is live:
function onServerReady() {
    console.log('Webserver running on port', port);
}

async function onGetVigtig_handelpartnere(request,response){
    const dbResult=await db.query("select ENHED,TID,LAND,INDUD,INDHOLD from Vigtigste_handelspartnere");
    response.json(dbResult.rows)
}

//The function "onKaffe" is called via an api route which is /onKaffe
//It receives an incoming HTTP request and prepares to send an HTTP response
async function onKaffe(request, response) {
    const result = await db.query(`
SELECT DISTINCT
      COALESCE(i.tid, e.tid) AS tid,
      COALESCE(i.land, e.land) AS land,
      CAST(i.indhold AS float) AS import_kaffe,
      CAST(e.indhold AS float) AS eksport_kaffe
    FROM 
      Import_Kaffe i
    FULL OUTER JOIN
      Eksport_Kaffe e
    ON 
      i.tid = e.tid AND i.land = e.land
    WHERE 
      (i.indhold ~ '^[0-9.]+$' OR e.indhold ~ '^[0-9.]+$')
      AND (
        CAST(i.indhold AS float) IS DISTINCT FROM 0 OR
        CAST(e.indhold AS float) IS DISTINCT FROM 0
      )
    ORDER BY 
      COALESCE(i.tid, e.tid),
      COALESCE(i.land, e.land);
  `);
  response.json(result.rows);
}
//SELECT DISTINCT is pretty self explanatory, we make sure our database doesn't give us duplicates.
//We are using COALESCE to handle "NULL" 
//This uses a FULL OUTER JOIN on tid (year). This basically means you'll get data from both tables in one table.
//WHERE i.indhold ~ '^[0-9.]+$' OR e.indhold ~ '^[0-9.]+$' filters out rows where indhold (the value) is not a number.
//This avoids empty or non numeric data such as "N/A" or "0"
//CAST as (float) changes a string like "123.45" to a number. Without the use of CAST you'd be treating numeric strings like text
////"CAST(i.indhold AS float) IS DISTINCT FROM 0" means to include the row if the import value is not 0 and same for export. This means that it'll remove the rows if both values are 0
//It keeps rows where i.indhold or e.indhold is a valid number. This is also a regex that will check for digits and decimals
//We sort the result at the end by "tid" and then "land" using COALESCE to handle "NULL's"


async function onMaskiner(request, response) {
    const result = await db.query(`
SELECT DISTINCT
      COALESCE(i.tid, e.tid) AS tid,
      COALESCE(i.land, e.land) AS land,
      CAST(i.indhold AS float) AS import_maskiner,
      CAST(e.indhold AS float) AS eksport_maskiner
    FROM 
      Import_Maskiner i
    FULL OUTER JOIN
      Eksport_Maskiner e
    ON 
      i.tid = e.tid AND i.land = e.land
    WHERE 
      (i.indhold ~ '^[0-9.]+$' OR e.indhold ~ '^[0-9.]+$')
      AND (
        CAST(i.indhold AS float) IS DISTINCT FROM 0 OR
        CAST(e.indhold AS float) IS DISTINCT FROM 0
      )
    ORDER BY 
      COALESCE(i.tid, e.tid),
      COALESCE(i.land, e.land);
  `);
  response.json(result.rows);
}

async function onLevendeDyr(request, response) {
    const result = await db.query(`
SELECT DISTINCT
      COALESCE(i.tid, e.tid) AS tid,
      COALESCE(i.land, e.land) AS land,
      CAST(i.indhold AS float) AS import_levende_dyr,
      CAST(e.indhold AS float) AS eksport_levende_dyr
    FROM 
      Import_levende_dyr i
    FULL OUTER JOIN
      Eksport_levende_dyr e
    ON 
      i.tid = e.tid AND i.land = e.land
    WHERE 
      (i.indhold ~ '^[0-9.]+$' OR e.indhold ~ '^[0-9.]+$')
      AND (
        CAST(i.indhold AS float) IS DISTINCT FROM 0 OR
        CAST(e.indhold AS float) IS DISTINCT FROM 0
      )
    ORDER BY 
      COALESCE(i.tid, e.tid),
      COALESCE(i.land, e.land);
  `);
  response.json(result.rows);
}

async function onMedicin(request, response) {
    const result = await db.query(`
SELECT DISTINCT
      COALESCE(i.tid, e.tid) AS tid,
      COALESCE(i.land, e.land) AS land,
      CAST(i.indhold AS float) AS import_medicin,
      CAST(e.indhold AS float) AS eksport_medicin
    FROM 
      Import_medicin i
    FULL OUTER JOIN
      Eksport_medicin e
    ON 
      i.tid = e.tid AND i.land = e.land
    WHERE 
      (i.indhold ~ '^[0-9.]+$' OR e.indhold ~ '^[0-9.]+$')
      AND (
        CAST(i.indhold AS float) IS DISTINCT FROM 0 OR
        CAST(e.indhold AS float) IS DISTINCT FROM 0
      )
    ORDER BY 
      COALESCE(i.tid, e.tid),
      COALESCE(i.land, e.land);
  `);
  response.json(result.rows);
}

async function onTobak(request, response) {
    const result = await db.query(`
SELECT DISTINCT
      COALESCE(i.tid, e.tid) AS tid,
      COALESCE(i.land, e.land) AS land,
      CAST(i.indhold AS float) AS import_tobak,
      CAST(e.indhold AS float) AS eksport_tobak
    FROM 
      Import_tobaksvarer i
    FULL OUTER JOIN
      Eksport_tobak e
    ON 
      i.tid = e.tid AND i.land = e.land
    WHERE 
      (i.indhold ~ '^[0-9.]+$' OR e.indhold ~ '^[0-9.]+$')
      AND (
        CAST(i.indhold AS float) IS DISTINCT FROM 0 OR
        CAST(e.indhold AS float) IS DISTINCT FROM 0
      )
    ORDER BY 
      COALESCE(i.tid, e.tid),
      COALESCE(i.land, e.land);
  `);
  response.json(result.rows);
}


//Think here we should combine all the tables together with join? This is just a scheme
async function onTotalEksport(request,response){
    const dbResult=await db.query("select SITC,LAND,INDUD,TID,INDHOLD from eksport_medicin");
    response.json(dbResult.rows)

}

//Think here we should combine all the tables together with join? This is just a scheme
async function onTotalImport(request,response){
    const dbResult=await db.query("select SITC,LAND,INDUD,TID,INDHOLD from import_levende_dyr");
    response.json(dbResult.rows)

}

