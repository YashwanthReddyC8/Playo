# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy common-models module
COPY common-models /app/common-models

# Copy auth-server module
COPY auth-server /app/auth-server

RUN apt-get update && apt-get install -y dos2unix
# Fix scripts
RUN dos2unix /app/common-models/mvnw && \
    dos2unix /app/auth-server/mvnw && \
    chmod +x /app/common-models/mvnw /app/auth-server/mvnw

# Build both in a single RUN command with persistent cache
RUN --mount=type=cache,target=/root/.m2 \
    cd /app/common-models && \
    ./mvnw -q clean install -DskipTests && \
    cd /app/auth-server && \
    ./mvnw -q clean package -DskipTests

EXPOSE 8081

CMD ["java", "-jar", "/app/auth-server/target/auth-server-0.0.1-SNAPSHOT.jar"]