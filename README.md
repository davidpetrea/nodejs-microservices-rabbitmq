# NodeJS Microservices example/template with RabbitMQ

This repository holds a simple starter/template configured example of a NodeJS microservice environment. It uses nginx as proxy and load balancer, with each service being a simple REST express server. Services can communicate via a RabbitMQ message broker.

## Build and run docker container

```
docker-compose up --build
```
