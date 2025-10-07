FROM nginx:latest


ENTRYPOINT ["/bin/bash", "-c", "envsubst < /tmp/nginx.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]