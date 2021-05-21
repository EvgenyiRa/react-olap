ARG CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX=""
FROM ${CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX}node:14.10 as builder
#ARG REACT_APP_DATA_SERVER
#ENV REACT_APP_DATA_SERVER=${REACT_APP_DATA_SERVER}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM ${CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX}nginx:1.19 as app

ENV NGINX_ENVSUBST_OUTPUT_DIR="/usr/share/nginx/html"

COPY --from=builder /app/build /usr/share/nginx/html
COPY src/settings.json.template /etc/nginx/templates/