FROM eclipse-temurin:21.0.8_9-jdk-jammy AS java
FROM node:22.19.0-bookworm-slim
COPY --from=java /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk PATH="/opt/java/openjdk/bin:${PATH}"
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY package*.json ./
RUN npm ci && npx playwright install --with-deps chromium
RUN mkdir -p /data /home/node/.cache/firebase && chown -R node:node /workspace /data /home/node/.cache && cp -r /root/.cache/ms-playwright /home/node/.cache/
COPY --chown=node:node . .
USER node
CMD ["npm","run","dev"]
