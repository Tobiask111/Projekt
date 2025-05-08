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


console.log('Recreating tables...');
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

console.log('Recreating tables...');
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

console.log('Recreating tables...');
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

console.log('Recreating tables...');
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

console.log('Recreating tables...');
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
    Data,
    'Data/Import_Kaffe.csv',
    'copy Import_Kaffe (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'
);

await upload(
    Data,
    'Data/Import_Levende Dyr.csv',
    'copy Import_Levende Dyr (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv'

);

await upload(
    Data,
    'Data/Import_Maskiner.csv',
    'copy Import_Maskiner (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv'
);

await upload(
    Data,
    'Data/Import_Medicin.csv',
    'copy Import_Medicin (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'
);

await upload(
    Data,
    'Data/Import_Tobaksvarer.csv',
    'copy Import_Tobaksvarer (SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'
);