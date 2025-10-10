# Why does the app container crash immediately?



# Why the app becomes unresponsive after some time?

The root cause of the issue is that the application runs out of database connections. The application code only releases database connections back to the connection pool when a request is successful, but due to an unfortunate bug in the code, connections are not released when a request results in an error. This leads to all available connections being used up over time. When this happens, new requests to the `/artists` and `/artists/:id` routes cannot get a database connection, and they become unresponsive.
