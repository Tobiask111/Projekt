import pg from 'pg';
import dotenv from 'dotenv';
import { upload } from 'pg-upload';

dotenv.config();

console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
});
const dbResult = await db.query('select now()');
console.log('Database connection established on', dbResult.rows[0].now);


console.log('Recreating table Eksport_Kaffe');
await db.query(`
drop table if exists Eksport_Kaffe;
create table Eksport_Kaffe (
sitc text,
land text,
indud text,
tid integer,
indhold integer
)`
);

console.log('Recreating table Eksport_Levende_Dyr');
await db.query(`
drop table if exists Eksport_Levende_Dyr;
create table Eksport_Levende_Dyr(
sitc text,
land text,
indud text,
tid integer,
indhold integer
)`
);

console.log('Recreating table Export_Maskiner');
await db.query(`
drop table if exists Eksport_Maskiner;    
create table Eksport_Maskiner(
sitc text,
land text,
indud text,
tid integer,
indhold integer
)`
);

console.log('Recreating table Export_Medicin');
await db.query(`
drop table if exists Eksport_Medicin;    
create table Eksport_Medicin(
sitc text,
land text,
indud text,
tid integer,
indhold integer
)`
);

console.log('Recreating table Export_Tobak');
await db.query(`
drop table if exists Export_Tobak;    
create table Export_Tobak(
sitc text,
land text,
indud text,
tid integer,
indhold integer
)`
);


await upload(
    db,
    'db/Eksport_Kaffe.csv',
    'copy Eksport_Kaffe (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/Eksport_Levende_dyr.csv',
    'copy Eksport_Levende_dyr (sitc, land, indud, tid, indhold) from stdin with csv header'

);

await upload(
    db,
    'db/Eksport_Maskiner.csv',
    'copy Eksport_Maskiner (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/Eksport_Medicin.csv',
    'copy Export_Medicin (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/Eksport_Kaffe.csv',
    'copy Eksport_Kaffe (sitc, land, indud, tid, indhold) from stdin with csv header'
);

console.log('Database and data ready');
process.exit();