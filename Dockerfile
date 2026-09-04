FROM node:18-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:18-alpine AS server
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production
COPY server/ ./
WORKDIR /app
COPY --from=client /app/client/dist ./client/dist
WORKDIR /app/server
EXPOSE 5000
CMD ["node", "index.js"]
