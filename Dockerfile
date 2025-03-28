FROM node:22-alpine AS BUILD_IMAGE

WORKDIR /app

COPY src src/
COPY prisma prisma/
COPY *.json ./
COPY *.ts ./
COPY tsconfig.json ./

SHELL ["/bin/sh", "-c"]

RUN npm install
RUN npm run build

# Expose the port the app runs on
EXPOSE 5001

FROM node:22-alpine
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/package*.json ./
COPY --from=BUILD_IMAGE /app/tsconfig.json ./

CMD ["npm", "start"]
