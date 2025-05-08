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
drop table if exists Import Kaffe;
create table Import Kaffe (
Import Kaffe_id integer,
SITC text,
Land text,
INDUD varchar(20),
TID integer,
INDHOLD integer
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists Import Levende Dyr;
create table Import Levende Dyr(
Import Levende Dyr_id integer,
SITC text,
Land text,
INDUD varchar(20),
TID integer,
INDHOLD integer
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists Import Maskiner;    
create table Import Maskiner(
Import Maskiner_id integer,
SITC text,
Land text,
INDUD varchar(20),
TID integer,
INDHOLD integer
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists Import Medicin;
create table Import Medicin(
Import Medicin_id integer,
SITC text,
Land text,
INDUD varchar(20),
TID integer,
INDHOLD integer
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists Import Tobaksvarer;
create table Import Tobaksvarer (
Import Tobaksvarer_id integer,
SITC text,
Land text,
INDUD varchar(20),
TID integer,
INDHOLD integer
)`
);


await upload(
    Data,
    'Data/Import Kaffe.csv',
    'copy Import Kaffe (Import Kaffe_id, SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'
);

await upload(
    Data,
    'Data/Import Levende Dyr.csv',
    'copy Import Levende Dyr (Import Levende Dyr_id, SITC, Land, INDUD, TID, INDHOLD) from stdin with csv'
    
);

await upload(
    Data,
    'Data/Import Maskiner.csv',
    'copy Import Maskiner (Import Maskiner_id, SITC, Land, INDUD, TID, INDHOLD) from stdin with csv'
);

await upload(
    Data,
    'Data/Import Medicin.csv',
    'copy Import Medicin (Import Medicin_id, SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'
);

await upload(
    Data,
    'Data/Import Tobaksvarer.csv',
    'copy Import Tobaksvarer (Import Tobaksvarer_id, SITC, Land, INDUD, TID, INDHOLD) from stdin with csv header'
);