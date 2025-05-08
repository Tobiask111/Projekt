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

// Drop og create alle tabeller
await db.query(`drop table if exists Eksport_Kaffe;
create table Eksport_Kaffe (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Eksport_Levende_dyr;
create table Eksport_Levende_dyr (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Eksport_Maskiner;
create table Eksport_Maskiner (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Eksport_Medicin;
create table Eksport_Medicin (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Eksport_Tobak;
create table Eksport_Tobak (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Import_Kaffe;
create table Import_Kaffe (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Import_Levende_dyr;
create table Import_Levende_dyr (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Import_Maskiner;
create table Import_Maskiner (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Import_Medicin;
create table Import_Medicin (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Import_Tobaksvarer;
create table Import_Tobaksvarer (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Import_Export;
create table Import_Export (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

await db.query(`drop table if exists Vigtigste_Handelspartnere;
create table Vigtigste_Handelspartnere (
    sitc text,
    land text,
    indud text,
    tid integer,
    indhold integer
)`);

// Upload CSV-data fra db/data-mappen
await upload(
    db,
    'db/data/Eksport_Kaffe.csv',
    'copy Eksport_Kaffe (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Eksport_Levende_dyr.csv',
    'copy Eksport_Levende_dyr (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Eksport_Maskiner.csv',
    'copy Eksport_Maskiner (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Eksport_Medicin.csv',
    'copy Eksport_Medicin (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Eksport_Tobak.csv',
    'copy Eksport_Tobak (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Import_Kaffe.csv',
    'copy Import_Kaffe (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Import_Levende_dyr.csv',
    'copy Import_Levende_dyr (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Import_Maskiner.csv',
    'copy Import_Maskiner (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Import_Medicin.csv',
    'copy Import_Medicin (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Import_Tobaksvarer.csv',
    'copy Import_Tobaksvarer (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Import_Export.csv',
    'copy Import_Export (sitc, land, indud, tid, indhold) from stdin with csv header'
);

await upload(
    db,
    'db/data/Vigtigste_Handelspartnere.csv',
    'copy Vigtigste_Handelspartnere (sitc, land, indud, tid, indhold) from stdin with csv header'
);

console.log('Database and data ready');
process.exit();