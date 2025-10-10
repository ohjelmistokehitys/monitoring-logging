import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { connect, release } from './db.js';

const app = new Hono();
app.use(prettyJSON());
app.use(logger());

app.get('/', (c) => {
    return c.text('Hello world!')
});

app.get('/artists', async (c) => {
    try {
        const conn = await connect();
        const result = await conn.query('SELECT * FROM artist');
        release(conn);
        return c.json(result.rows);
    } catch (err) {
        let message = (err instanceof Error) ? err.message : 'Unknown error';
        return c.json({ error: 'Database error', details: message }, 500);
    }
});


app.get('/artists/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const conn = await connect();
        const artist = (await conn.query('SELECT * FROM artist WHERE artist_id = $1', [id])).rows[0];
        const albums = (await conn.query('SELECT * FROM album WHERE artist_id = $1', [artist.artist_id])).rows;

        release(conn);

        if (!artist) {
            return c.json({ error: 'Artist not found' }, 404);
        }
        return c.json({ artist, albums: albums });

    } catch (err) {
        let message = (err instanceof Error) ? err.message : 'Unknown error';
        return c.json({ error: 'Database error', details: message }, 500);
    }
});

export default app;
