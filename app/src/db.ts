import { Pool, type PoolClient, type PoolConfig } from 'pg';

const config: PoolConfig = {
    host: process.env.POSTGRES_HOST,
    port: +(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
};

const pool = new Pool(config);

export const connect = () => {
    console.log('Connecting to database...');
    return pool.connect();
}
export const release = (conn: PoolClient) => {
    console.log('Releasing database connection...');
    conn.release()
};
