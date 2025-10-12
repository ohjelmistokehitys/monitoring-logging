# Why does the app container crash immediately?


When inspecting the logs, pay attention to the timestamps of the following log entries.

App container logs:

```diff
  Server is running on http://localhost:3333
  Connecting to database...
  /app/node_modules/pg-pool/index.js:45
     Error.captureStackTrace(err)
+    Error: connect ECONNREFUSED 172.19.3:5432
     at /app/node_modules/pg-pool/index.js:45:11
     at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
```

Postgres container logs:

```diff
  starting PostgreSQL 18.0 (Debian 18.0-1.pgdg13+3) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
  listening on IPv4 address "0.0.0.0", port 5432
  listening on IPv6 address "::", port 5432
  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
+ database system is ready to accept connections
```

In the initial phase, the app container starts and tries to connect to the database before the database is ready to accept connections.


# Why the app becomes unresponsive after some time?

The root cause of the issue is that the application runs out of database connections. The application code only releases database connections back to the connection pool when a request is successful, but due to an unfortunate bug in the code, connections are not released when a request results in an error

When a request succeeds, there is both "Connecting to database..." and "Releasing database connection..." log entries:

```diff
  <-- GET /artists/257
+ Connecting to database...
+ Releasing database connection...
  --> GET /artists/257 200 21ms
```

When a request fails, there is only "Connecting to database..." log entry, but no "Releasing database connection..." log entry. Therefore, the database connection is never released back to the connection pool:

```diff
  <-- GET /artists/999999
+ Connecting to database...
  --> GET /artists/999999 500 3ms
  Error while getting artist by id 999999 TypeError: Cannot read properties of undefined (reading 'artist_id')
      at file:///app/dist/app.js:28:94
      at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
      at async dispatch (file:///app/node_modules/hono/dist/compose.js:22:17)
      at async logger2 (file:///app/node_modules/hono/dist/middleware/logger/index.js:38:5)
      at async dispatch (file:///app/node_modules/hono/dist/compose.js:22:17)
      at async prettyJSON2 (file:///app/node_modules/hono/dist/middleware/pretty-json/index.js:6:5)
      at async dispatch (file:///app/node_modules/hono/dist/compose.js:22:17)
      at async file:///app/node_modules/hono/dist/hono-base.js:201:25
      at async responseViaResponseObject (file:///app/node_modules/@hono/node-server/dist/index.mjs:412:13)
      at async Server.<anonymous> (file:///app/node_modules/@hono/node-server/dist/index.mjs:551:14)
```

This leads to all available connections being used up over time. When this happens, new requests to the `/artists` and `/artists/:id` routes cannot get a database connection, and they become unresponsive.
