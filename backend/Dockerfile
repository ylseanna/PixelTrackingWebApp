FROM docker.io/library/python:3.11-slim AS base

FROM base AS dev
WORKDIR /app
COPY ./requirements.txt .
RUN pip install -r requirements.txt --root-user-action=ignore

# Run as non-root user
RUN addgroup --system --gid 1001 python
RUN adduser --system --uid 1001 --gid 1001 python


USER python

EXPOSE 5000



FROM dev AS prod
WORKDIR /app
COPY --chown=python:python . .

# Create Flask cache directory and give ownership to python user
USER root
RUN mkdir /app/cache && chown python:python /app/cache
USER python

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]
