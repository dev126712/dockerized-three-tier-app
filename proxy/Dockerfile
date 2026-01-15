FROM nginx:latest

RUN apt update \
    && apt install -y curl gettext \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash nginxuser \
    && chown -R nginxuser:nginxuser /etc/nginx \
    && chown -R nginxuser:nginxuser /var/cache/nginx /var/run /var/log/nginx

USER nginxuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost/ || exit 1

ENTRYPOINT ["/bin/bash", "-c", "envsubst '${FRONTEND_SERVER_ADDR} ${API_SERVER_CONTAINER_NAME} ${API_SERVER_PORT} ${REVERSE_PROXY_PORT}' < /tmp/nginx.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off; pid /tmp/nginx.pid;'"]
