# Pixel Tracking Web App

## Development

To run the development server, use the following command:

```sh
sudo docker compose -f compose.yml -f compose.dev.yml up --build
```

The app will be accessible at <http://localhost:8080/pixeltracking>

## Production

To run the app in production, use the following command:

```sh
sudo docker compose up --build
```

The app will be accessible at <http://localhost:8080/pixeltracking>

This may change in the future as the nginx component may be removed in favor of using Apache as a reverse proxy directly.
