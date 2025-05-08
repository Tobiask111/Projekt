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
create table Import Kaffe  (
album_id integer,
artist_id integer,
release_date date,
title text,
riaa_certificate text
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists artists;
create table artists(
artist_id integer,
nationality char(2),
stage_name text
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists users;    
create table users(
user_id bigint,
signed_up timestamp,
active boolean,
screen_name text,
email text
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists playlists;
create table playlists(
playlist_id bigint,
user_id bigint,
created timestamp,
name text
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists tracks;
create table tracks (
track_id integer,
album_id integer,
media_type_id integer,
genre_id integer,
milliseconds integer,
bytes bigint,
unit_price numeric(10,2),
title text
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists playlist_track;
create table playlist_track(
playlist_id bigint,
track_id integer
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists genres;
create table genres(
genre_id integer,
name text,
description text
)`
);

console.log('Recreating tables...');
await db.query(`
drop table if exists media_types;
create table media_types(
media_type_id integer,
bit_depth integer,
sample_rate real,
lossless boolean,
name text,
description text
)`
);


await upload(
    db,
    'db/albums.csv',
    'copy albums (album_id, title, artist_id, release_date, riaa_certificate) from stdin with csv header'
);

await upload(
    db,
    'db/artists.csv',
    'copy artists (artist_id, stage_name, nationality) from stdin with csv'

);

await upload(
    db,
    'db/genres.csv',
    'copy genres (name, genre_id, description) from stdin with csv'
);

await upload(
    db,
    'db/users.csv',
    'copy users (user_id, screen_name, email, active, signed_up) from stdin with csv header'
);

await upload(
    db,
    'db/playlists.csv',
    'copy playlists (playlist_id, created, user_id, name) from stdin with csv header'
);

await upload(
    db,
    'db/tracks.csv',
    'copy tracks (track_id, title, album_id, media_type_id, genre_id, milliseconds, bytes, unit_price) from stdin with csv header'
);

await upload(
    db,
    'db/playlist_track.csv',
    'copy playlist_track (playlist_id, track_id) from stdin with csv header'
);

await upload(
    db,
    'db/media_types.csv',
    'copy media_types (media_type_id, name, description, sample_rate, bit_depth, lossless) from stdin with csv header'

); 
