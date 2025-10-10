import { serve } from '@hono/node-server';
import app from './app.js';
import { connect, release } from './db.js';

const PORT = process.env.PORT ? Number(process.env.HONO_PORT) : 3333;

serve({
    fetch: app.fetch,
    port: PORT
}, async (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);

    const conn = await connect();
    const database = await conn.query('SELECT current_database()');
    console.log(`Connected to database: ${database.rows[0].current_database}`);
    release(conn);
});
