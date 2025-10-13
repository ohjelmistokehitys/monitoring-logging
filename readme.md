# Monitoring and logging

This exercise will introduce you to centralized logging and monitoring of applications. Logging and monitoring are essential parts of modern software development and operations, as they help in understanding application behavior, diagnosing issues, and ensuring system reliability. 

Setting up a monitoring and logging stack can be complex, so this exercise provides a ready-made infrastructure where you can try out these tools. This exercise does not contain an in-depth introduction to the tools used, but you can find links to their documentation below.

Find sources and tutorials about these tools online, and explore their features. The goal of this exercise is to get you familiar with a minimal set of tools and concepts, so you can continue learning on your own.


## The infrastructure

The exercise infrastructure consists of two separate Docker compose setups: one for the application stack and one for the monitoring stack.

There are many ports that need to be opened for the services to work properly. It is recommended that you stop any other potential services on your system that might use the same ports, or change the ports in the [docker-compose.yml](./docker-compose.yml) and [docker-monitoring/docker-compose.yml](./docker-monitoring/docker-compose.yml) files.

> [!NOTE]
> The monitoring stack integrates with the Docker daemon to collect logs and metrics from all running containers, including the application stack. This setup allows you to monitor the application's performance and view its logs in a centralized manner. 
>
> However, all other containers on your system will also be monitored, so be aware of that.
>
> If you want to avoid monitoring other containers on your system, you can run this exercise on [GitHub codespaces](https://github.com/features/codespaces) or in a separate virtual machine.


### The application stack

The application stack includes a web application that connects to a PostgreSQL database. The application is built using the [Hono](https://hono.dev/) web framework and uses the [pg](https://node-postgres.com/) library to interact with the PostgreSQL database.

The application's container uses the [default Node.js image](https://hub.docker.com/_/node) as its base image, and the database is based on the [official PostgreSQL image](https://hub.docker.com/_/postgres). The database is initialized with the [Chinook example database](https://www.github.com/lerocha/chinook-database), which contains sample data about artists, albums, and tracks.

You don't need to understand the application code in detail for this exercise. If you want to, you can explore the following files in the [app](./app) folder more deeply:

* [Dockerfile](./app/Dockerfile): defines how to build the application Docker image
* [src/app.ts](./app/src/app.ts): the main application code, which defines the web server and its routes ([/](http://localhost:3333), [/artists](http://localhost:3333/artists) and [/artists/:id](http://localhost:3333/artists/1))
* [src/db.ts](./app/src/db.ts): database connection code
* [src/server.ts](./app/src/server.ts): starts the web server


> [!NOTE]
> There are issues in the application that cause it to crash or become partly unoperational. You don't need to fix these issues in the source code, but instead investigate them using the monitoring stack.
>
> You also don't need to install, build or run the application locally, as it will be run inside a Docker container.


### The monitoring stack

The monitoring stack consists of several popular open-source tools:

* [loki](https://grafana.com/oss/loki/) for log aggregation
* [prometheus](https://prometheus.io/) for metrics collection
* [grafana](https://grafana.com/) for visualization of metrics and logs
* [alloy](https://grafana.com/oss/alloy-opentelemetry-collector/) as a metrics and logs collector.

The setup is based on the [Monitor Docker containers with Grafana Alloy](https://grafana.com/docs/alloy/latest/monitor/monitor-docker-containers/) section in Grafana documentation. The [Docker compose file](./docker-monitoring/docker-compose.yml) and [configuration files](./docker-monitoring/) have been copied from the [Grafana Alloy Scenarios repository](https://github.com/grafana/alloy-scenarios/).

> [!WARNING]
> By default, this setup does not include any authentication, so anyone who can access the Grafana web interface can also view the logs and metrics. This is acceptable for local development and testing, but in a production environment, you should always enable authentication and restrict access to authorized users only.


## Starting the monitoring stack

To get started, follow the instructions in the [Monitor Docker containers with Grafana Alloy](https://grafana.com/docs/alloy/latest/monitor/monitor-docker-containers/) article. Start by starting the monitoring stack:

```sh
cd docker-monitoring

# on Windows:
docker compose up -d

# on Linux:
docker compose -f docker-compose-linux.yml up -d
```

Verify that you have containers running:

```sh
docker ps
```

The output should show containers for `alloy`, `loki`, `prometheus`, and `grafana`.

Then, open [http://localhost:3000](http://localhost:3000) in your web browser to access the Grafana web interface. 

> *"To explore metrics, open your browser and go to http://localhost:3000/explore/metrics.*
>
> *To use the Grafana Logs Drilldown, open your browser and go to http://localhost:3000/a/grafana-lokiexplore-app."*
> 
> https://grafana.com/docs/alloy/latest/monitor/monitor-docker-containers/#visualize-your-data


## Starting the application stack

The application stack requires a few environment variables to be set. Examples of these are provided in the [.env.example](./.env.example) files. Before starting the application stack, copy the example file to a new file named `.env` and edit it to set the required environment variables:

```sh
# at the same folder as this readme.md file:
cp .env.example .env
```

PostgreSQL uses the environment variables to create the initial database and user. If you later change these environment variables, the changes won't effect the existing database or user.

After setting up the environment variables, use Docker compose to start the application stack:

```sh
docker compose up -d
```

On first startup, the stack will take a while to start, as the app container needs to be built from the [Dockerfile](./app/Dockerfile) and base images need to be downloaded. The PostgreSQL container will also initialize the database with the Chinook example database, as the [sql](./sql/) folder is mounted as a volume to the container in the [initialization scripts folder](https://hub.docker.com/_/postgres#initialization-scripts).

You can check the status of your containers with either `docker stats`, `docker ps` or `docker compose ps` commands:

```sh
# shows resource usage statistics of running containers:
docker stats

# shows a list of running containers:
docker ps

# shows a list of containers defined in the current compose file:
docker compose ps
```

You will likely notice that the `app` container is not running properly. Use the Grafana log explorer in your Grafana service, which was started earlier in the exercise: http://localhost:3000. Logs can be found on the menu from *Drilldown* and *Logs*. Investigate the logs of the `app` and `postgres` containers and find out what is wrong and what caused the `app` container to crash.

Instructions on how to inspect logs in Grafana can be found, for example, on [Grafana documentation](https://grafana.com/docs/grafana/latest/explore/simplified-exploration/logs/get-started/) or [this YouTube video](https://youtu.be/eXwE2vqLcyY). If you can't figure it out, check the explanation in the [hints and solutions](./hints.md) file.


## Fixing the startup order of containers

As it turns out, both of the containers start at the exact same time, and the `app` container tries to connect to the `postgres` container before it is ready to accept connections. The connection is refused, and the `app` container crashes.

The startup order of containers is often important and it can be controlled in the `docker-compose.yml` file with the `depends_on` directive. However, this only ensures that the `postgres` container is started before the `app` container, but it does not guarantee that the database server inside the `postgres` container is ready to accept connections.

Follow the instruction in the [Control startup and shutdown order in Compose](https://docs.docker.com/compose/how-tos/startup-order/) document in Docker documentation to add a healthcheck to the `postgres` service in the [docker-compose.yml](./docker-compose.yml) file. Also, add a `depends_on` directive to the `app` service to ensure that it starts only after the `postgres` service is healthy.


The steps to take are the same as in the [Control startup and shutdown order in Compose](https://docs.docker.com/compose/how-tos/startup-order/) document. Be careful to apply the example with the service names and [environment variables](./.env.example) from our application.

When you have made changes, restart the application stack with the `down` and `up` commands:

```sh
docker compose down
docker compose up -d
```

If the changes are effective, when you run `docker ps`, you should see the `app` container running properly and the `postgres` container should have the word `(healthy)` in the `STATUS` column.


## Try out the application

You can now try out the application by opening [http://localhost:3333](http://localhost:3333) in your web browser. You should see hello world text.

The application has two additional routes:

* [http://localhost:3333/artists](http://localhost:3333/artists?pretty): Lists all artists in the database
* [http://localhost:3333/artists/1](http://localhost:3333/artists/1?pretty): Shows details of the artist with ids from [1](http://localhost:3333/artists/1?pretty) to [275](http://localhost:3333/artists/275?pretty).

You can use either your browser or a command line tool like `curl` to access these routes. Add a `?pretty` query parameter to get pretty-printed JSON responses:

```sh
curl http://localhost:3333/artists?pretty
curl http://localhost:3333/artists/1?pretty
```

Keep your eye on the Grafana log explorer while you access the application. You should see log entries from both the `app` and `postgres` containers. You can also use the [Grafana metrics explorer](http://localhost:3000/explore/metrics) to explore metrics collected from Docker, although with this much traffic, the metrics are quite static.


## A bug in the application

Unfortunately, the application has issues. The following email from your product owner explains the situation:

> Hi,
> 
> We have received reports from users that the application sometimes becomes partly unresponsive. We need to investigate this issue and ensure that the application is stable and reliable. Restarting the application seems to temporarily fix the issue, but it always reoccurs after some time.
>
> The front page with the "Hello World!" message seems to work fine, and the container itself is running without crashing, but the */artists* and */artists/:id* routes get "stuck" and stop returning responses. We need to find out what is causing these issues and fix them as soon as possible.
>
> In our production logs, we noticed that there are always a few 404 errors for the */artists/:id* route before the application becomes unresponsive. This might be a clue to the root cause of the problem. Other 404 errors, such as the one with favicon.ico, do not seem to cause any issues.
>
> Please try to reproduce the issue in your development environment and investigate the logs and metrics to identify the problem. We need to ensure that the application is stable and reliable for our users.

Use the Grafana log explorer to investigate the logs from the `app` container. Make both queries that work and those that return 404 errors. See if there are any differences in the logs between the working and non-working requests. Keep making requests until the application becomes unresponsive.


### Finding the root cause

Copy the relevant log entries from the application logs to the [app-log.txt](./app-log.txt). Include both entries before and after the application becomes unresponsive. You can copy the log entries either by copying them from the Grafana log explorer or by using the `docker logs` command:

```sh
docker logs app
```

If you can't figure it out, check the explanation in the [hints and solutions](./hints.md) file.


## Monitor the app container health

As the product owner mentioned in the message, this issue can be temporarily fixed by restarting the application, which releases all database connections. The issue will reoccur after some time, but for now we can use this workaround to at least keep the application running.

To mitigate this issue, configure Docker compose to monitor the `app` container's health. This check can be similar to the one used for the `postgres` container. In this case, you want to check that the application returns a successful response for either of the routes that access the database. 

The check can be implemented, for example, by calling the `/artists` route with the `curl` command. A similar example can be found in the [Docker documentation](https://docs.docker.com/reference/compose-file/services/#healthcheck) with a code snippet that uses `curl` to check a web service. The example in the documentation has one severe weakness: it does not have a timeout, so it would not fail if the application does not respond. Make sure to add a timeout to your `curl` command.

Fortunately, the `curl` command is already included in the base image, so you can use it without modifying the image. Add a healthcheck to the `app` service in the [docker-compose.yml](./docker-compose.yml) file. Feel free to choose appropriate intervals, timeouts and other attributes. When you have made changes, restart the application stack with:

```sh
docker compose down
docker compose up -d
```

Now, if the application becomes unresponsive and the healthcheck fails, the status of the `app` container will change to `unhealthy`. You can see this by running the `docker ps` command:

```sh
docker ps
```

Wit the *unhealthy* status, you could configure an orchestrator like Kubernetes or Docker Swarm to automatically restart the container. Sadly, at the time of writing, Docker compose does not support automatic restarts on failed healthchecks. 


## Submitting your solutions

Once you have solved part or all of the tasks and committed your answers, submit your solutions for evaluation using the `git push` command. Git push will automatically trigger a workflow that checks your submission.

After GitHub Actions has checked your solution, you can see the result on your repository's actions tab.


# Licenses

## Docker

> "The Docker Engine is licensed under the Apache License, Version 2.0. See LICENSE for the full license text."
>
> "However, for commercial use of Docker Engine obtained via Docker Desktop within larger enterprises (exceeding 250 employees OR with annual revenue surpassing $10 million USD), a paid subscription
is required."
>
> https://docs.docker.com/engine/


## PostgreSQL

> "PostgreSQL is released under the PostgreSQL License, a liberal Open Source license, similar to the BSD or MIT licenses."
>
> https://www.postgresql.org/about/licence/


## Chinook database

Chinook database is created by [Luis Rocha](https://github.com/lerocha) and it is licensed under the [MIT license](https://github.com/lerocha/chinook-database/blob/master/LICENSE.md).


## Grafana Alloy Scenarios

The [Grafana Alloy Scenarios](https://github.com/grafana/alloy-scenarios/) project is licensed under the [Apache 2.0 License](https://github.com/grafana/alloy-scenarios/blob/main/LICENSE).


## This exercise

This exercise is made by Teemu Havulinna and it is licensed under the [Creative Commons BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/) license.

AI assistants, such as ChatGPT and GitHub copilot, have been used to implement the exercise.
