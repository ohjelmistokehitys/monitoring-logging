import { serve } from '@hono/node-server';
import app from './app.js';
import { connect, release } from './db.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

serve({
    fetch: app.fetch,
    port: PORT
}, async (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);

    const conn = await connect();
    const database = await conn.query('SELECT current_database()');
    console.log(`Connected to database: ${database.rows[0].current_database}`);
    release(conn);
});
