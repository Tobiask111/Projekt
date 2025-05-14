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
});
const dbResult = await db.query('select now() as now');
console.log('Database connection established on', dbResult.rows[0].now);

import express from 'express';
import { title } from 'process';

console.log('Initialising webserver...');
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

//These will filter our endpoints to show exact years or countries whatever if we need it
//GET /api/trade/export?year=2023
//GET /api/trade/import?country=Germany


server.listen(port, onServerReady);

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

async function onGetVigtig_handelpartnere(request,response){
    const dbResult=await db.query("select ENHED,TID,LAND,INDUD,INDHOLD from Vigtigste_handelspartnere");
    response.json(dbResult.rows)
}

//Join import and export tables together for this to show?
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
//This uses a FULL OUTER JOIN on tid (year). This basically means you'll get year from both tables
//WHERE i.indhold ~ '^[0-9.]+$' OR e.indhold ~ '^[0-9.]+$' filters out rows where indhold (the value) is not a number. 
// It keeps rows where i.indhold or e.indhold is a valid number. This is also a regex that will check for digits and decimals
// COALESCE(i.tid, e.tid) chooses the non-null "tid" value from either table. You pretty much sum them all togehter (years)


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

