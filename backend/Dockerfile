FROM python:3.11-slim AS base

FROM base AS dev
WORKDIR /app
COPY ./requirements.txt .
RUN pip install -r requirements.txt

EXPOSE 5000



FROM dev AS prod
WORKDIR /app
COPY . .
