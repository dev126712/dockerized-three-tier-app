## Day 4: Traffic Management and Infrastructure Hardening (Reverse Proxy)

#### Day 4 focused on transitioning the application from a simple local stack to a production-ready architecture by introducing an Nginx Reverse Proxy and automating the configuration to eliminate brittle manual steps.

### 1. Goal: Implementing the Reverse Proxy (Nginx)

#### The primary objective was to place an Nginx reverse proxy in front of the application to serve as a single entry point (Ingress) and eleminating the need for the browser to know the frontend internal port(8080).

# Challenges:


## Host Not Found / DNS Error (host not found in upstream "frontend")

### Probleme 1:
#### The reverse proxy was only able to 'proxy_pass' the request to the frontend by hardcoding the ec2 instance public addresse wich is not a good practice for security and for code reusable(Iac). The reverse_proxy service was not explicitly attached to the custom Docker network (mynetwork) where the frontend service resided.

### Resolution: 
#### Explicitly added the networks: [mynetwork] block to the reverse_proxy service in docker-compose.yml, allowing it to resolve hostnames via Docker's internal DNS without the need to go to public internet. It's a good practice for security measure and latency.


## Configuration Context Error (events directive not allowed)

### Probleme 2:
#### Custom Nginx config was loaded directly into the primary /etc/nginx/nginx.conf which requires top-level directives (like events and http).

### Resolution: 
#### Wrapped the entire configuration in the required events {} and http {} blocks to make it a valid, self-contained configuration file.

## Variable Substitution Failure (unknown "variable", invalid number of arguments)

### Probleme 3: 

#### Nginx's envsubst utility failed because environment variables (like ${API_SERVER_PORT}) were empty or unset during container startup, leading to broken syntax in the final config file.

### Resolution: 
#### Removed reliance on most dynamic environment variables inside the Nginx config, instead using Docker's guaranteed internal container names and ports (e.g., $FRONTEN_CONTAINER_NAME:$FRONTEND_PORT).



















