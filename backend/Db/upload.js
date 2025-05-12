import fs from 'fs';
import { pipeline } from 'stream/promises';
import { from } from 'pg-copy-streams';  // Importér `from` korrekt
import pg from 'pg';

export async function upload(db, filePath, copyCommand) {
    const client = await db.connect();
    try {
        const stream = client.query(from(copyCommand));  // Brug `from` korrekt
        const fileStream = fs.createReadStream(filePath);
        await pipeline(fileStream, stream);
        console.log(`✅ Upload lykkedes fra: ${filePath}`);
    } catch (err) {
        console.error(`❌ Fejl under upload fra: ${filePath}`);
        console.error(err.message);
    } finally {
        client.release();
    }
}
