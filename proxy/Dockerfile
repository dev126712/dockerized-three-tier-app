FROM nginx:latest


ENTRYPOINT ["/bin/bash", "-c", "envsubst < /tmp/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]