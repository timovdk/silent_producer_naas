# Creates the Silent-producer, uploading all AVRO schemas to the Kafka schema registry.
#
# You can access the container using:
#   docker run -it silent-producer sh
# To start it stand-alone:
#   docker run -it silent-producer

FROM node:12-alpine as builder
RUN mkdir -p ./code
COPY package.json /code/package.json
WORKDIR /code
RUN npm i
COPY ./tsconfig.json .
COPY ./src/silent-producer.ts ./src/silent-producer.ts
RUN npm run build

FROM node:12-alpine
RUN mkdir -p /app
COPY ./src/schemas /src/schemas
COPY ./package.json /app/package.json
COPY --from=builder /code/dist /app
COPY package.json /app/package.json
# COPY --from=builder /code/node_modules /app/node_modules
WORKDIR /app
RUN npm i --only=prod
CMD ["node", "silent-producer.js"]
