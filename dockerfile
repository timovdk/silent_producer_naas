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
COPY --from=builder /code/dist /app
COPY --from=builder /code/node_modules /app/node_modules
CMD ["node", "/app/silent-producer.js"]
