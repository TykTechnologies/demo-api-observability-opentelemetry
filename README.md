# API Observability with OpenTelemetry

## About

This is a demo project running on Docker, that shows how to configure Tyk Gateway OSS, OpenTelemetry Collector, Jaeger, Prometheus and Grafana OSS to set-up an API observability dashboard for your APIs managed by Tyk.





## Deploy and run the demo

1. Clone this repository:

```
git clone https://github.com/SonjaChevre/api-observability-opentelemetry.git
```

2. Start the services

```
cd ./api-observability-opentelemetry/
docker compose up -d
```

3. Verify that all services are running

- Tyk Gateway - health check runs on [http://localhost:8080/hello](http://localhost:8080/hello)
- Jaeger runs on [http://localhost:16686/](http://localhost:16686/)
- Prometheus runs on [http://localhost:9090/](http://localhost:9090/)
- Grafana OSS runs on [http://localhost:3000/](http://localhost:3000/)
    - The default log-in at start is admin/admin, once logged in you will be prompted for a new password

4. Generate traffic

[K6](https://k6.io/) is used to generate traffic to the API endpoints. The load script [load.js](./deployments/k6/load.js) will run for 15 minutes.

```
docker compose run  k6 run /scripts/load.js
```


5. Check out the dashboard in Grafana

Go to [Grafana](http://localhost:3000/) in your browser (initial user/pwd: admin/admin) and open the dashboard called [*API Observability*](./deployments/grafana/provisioning/dashboards/API-observability.json).


## Tear down

Stop the services

```
docker compose stop
```

Remove the services

```
docker compose down
```

