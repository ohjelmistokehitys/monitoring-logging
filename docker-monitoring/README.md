# Docker Monitoring with Grafana Alloy

This directory has been copied from the [Grafana Alloy Scenarios repository](https://github.com/grafana/alloy-scenarios) to provide an example of monitoring Docker containers using Grafana Alloy.

The exact version of the repository this was copied from is [b4ad4ca](https://github.com/grafana/alloy-scenarios/tree/b4ad4ca7a65097293b01d9476dd17bfec5dc0276).

For more details on the usage and purpose of this scenario, refer to the official Grafana documentation: https://grafana.com/docs/alloy/latest/monitor/monitor-docker-containers/.

## License

The [Grafana Alloy Scenarios](https://github.com/grafana/alloy-scenarios/) project is licensed under the[ Apache 2.0 License](https://github.com/grafana/alloy-scenarios/blob/main/LICENSE).

## Prerequisites
- Docker
- Docker Compose
- Git

## Running the Demo

### Step 1: Clone the repository
```bash
git clone https://github.com/grafana/alloy-scenarios.git
```

### Step 2: Deploy the monitoring stack
```bash
cd alloy-scenarios/docker-monitoring
docker-compose up -d
```

### Step 3: Access Grafana Alloy UI
Open your browser and go to `http://localhost:12345`. 

### Step 4: Access Grafana UI
Open your browser and go to `http://localhost:3000`.


