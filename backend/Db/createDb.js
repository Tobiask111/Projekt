import pg from 'pg';
import dotenv from 'dotenv';


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

console.log('Recreating table Eksport_Maskiner');
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

console.log('Recreating table Eksport_Medicin');
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

console.log('Recreating table Eksport_Tobak');
await db.query(`
drop table if exists Eksport_Tobak;    
create table Eksport_Tobak(
sitc text,
land text,
indud text,
tid integer,
indhold integer
)`
);

console.log('Recreating tables Import_Kaffe');
await db.query(`
drop table if exists Import_Kaffe;
create table Import_Kaffe (
SITC text,
Land text,
INDUD text,
TID integer,
INDHOLD integer
)`
);

console.log('Recreating tables Import_Levende_Dyr');
await db.query(`
drop table if exists Import_Levende_Dyr;
create table Import_Levende_Dyr(
SITC text,
Land text,
INDUD text,
TID integer,
INDHOLD integer
)`
);

console.log('Recreating tables Import_Maskiner');
await db.query(`
drop table if exists Import_Maskiner;    
create table Import_Maskiner(
SITC text,
Land text,
INDUD text,
TID integer,
INDHOLD integer
)`
);

console.log('Recreating tables Import_Medicin');
await db.query(`
drop table if exists Import_Medicin;
create table Import_Medicin(
SITC text,
Land text,
INDUD text,
TID integer,
INDHOLD integer
)`
);

console.log('Recreating tables Import_Tobaksvarer');
await db.query(`
drop table if exists Import_Tobaksvarer;
create table Import_Tobaksvarer (
SITC text,
Land text,
INDUD text,
TID integer,
INDHOLD integer
)`
);


await upload(
    db,
    'Data/Eksport_Kaffe.csv',
    'copy Eksport_Kaffe (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'Data/Eksport_Levende_dyr.csv',
    'copy Eksport_Levende_dyr (sitc, land, indud, tid, indhold) from stdin with csv header'

);

await upload(
    db,
    'Data/Eksport_Maskiner.csv',
    'copy Eksport_Maskiner (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'Data/Eksport_Medicin.csv',
    'copy Eksport_Medicin (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'Data/Eksport_Kaffe.csv',
    'copy Eksport_Kaffe (sitc, land, indud, tid, indhold) from stdin with csv header'
);


await upload(
    db,
    'Data/Import_Kaffe.csv',
    'copy Import_Kaffe (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'
);

await upload(
    db,
    'Data/Import_Levende_dyr.csv',
    'copy Import_Levende_dyr (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv'

);

await upload(
    db,
    'Data/Import_Maskiner.csv',
    'copy Import_Maskiner (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv'
);

await upload(
    db,
    'Data/Import_Medicin.csv',
    'copy Import_Medicin (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'
);

await upload(
    db,
    'Data/Import_Tobaksvarer.csv',
    'copy Import_Tobaksvarer (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'

);
console.log('Database and data ready');
process.exit();