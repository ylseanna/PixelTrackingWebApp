FROM docker.io/nginxinc/nginx-unprivileged:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY /nginx.conf /etc/nginx/templates/nginx.conf.template
