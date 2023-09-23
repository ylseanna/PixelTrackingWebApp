# Pixel Tracking Web App

## Development

To run the development server, use the following command:

```sh
docker compose -f compose.yml -f compose.dev.yml up --build -V
```

The app will be accessible at <http://localhost:8080/pixeltracking>

## Production

To run the app in production mode, use the following command:

```sh
docker compose up --build
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

If the app is already running, `docker compose up` must be run again in order to recreate the containers. The entire update (image and container recreation) can be done all at once using the following command:

```sh
docker compose up --build -d
```

## Stopping

To stop the services after running the app and remove the containers and network, use the following command:

```sh
docker compose down
```

Running the app in development mode creates volumes which can be cleaned up by adding the `-v` flag to the command above.
