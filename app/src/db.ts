import { Pool, type PoolClient } from 'pg';

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: +(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
});

export const connect = () => {
    console.log('Connecting to database...');
    return pool.connect();
}
export const release = (conn: PoolClient) => {
    console.log('Releasing database connection...');
    conn.release()
};
