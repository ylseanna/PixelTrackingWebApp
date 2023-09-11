# Pixel Tracking Web App

## Development

To run the development server, use the following command:

```sh
sudo docker compose -f compose.yml -f compose.dev.yml up --build -V
```

The app will be accessible at <http://localhost:8080/pixeltracking>

## Production

To run the app in production, use the following command:

```sh
sudo docker compose up --build
```

The app will be accessible at <http://localhost:8080/pixeltracking>

## Cleaning up

To clean up after running the app in either mode and remove containers and volumes, use the following command:

```sh
sudo docker compose down -v
```
