# Pixel Tracking Web App

## Development

To run the development server, use the following command:

```sh
sudo docker compose -f compose.yml -f compose.dev.yml up --build -V
```

The app will be accessible at <http://localhost:8080/pixeltracking>

## Production

To run the app in production mode, use the following command:

```sh
sudo docker compose up --build
```

The app will be accessible at <http://localhost:8080/pixeltracking>

### Deployment

When deploying, run the app in detached mode:

```sh
docker compose up -d
```

The services are set to always restart so as long as the Docker daemon is run on startup, the app will keep running.

If the app code is changed after the first launch, the images need to be rebuilt using the following command:

```sh
docker compose build
```

## Cleaning up

To clean up after running the app in either mode and remove containers and volumes, use the following command:

```sh
sudo docker compose down -v
```
