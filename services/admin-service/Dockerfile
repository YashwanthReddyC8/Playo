# Build stage
FROM eclipse-temurin:21-jdk-jammy as builder
WORKDIR /app

# Copy common-models module
COPY common-models /app/common-models

# Copy admin-service module
COPY admin-service /app/admin-service

RUN apt-get update && apt-get install -y dos2unix
# Fix scripts
RUN dos2unix /app/common-models/mvnw && \
    dos2unix /app/admin-service/mvnw && \
    chmod +x /app/common-models/mvnw /app/admin-service/mvnw

# Build both in a single RUN command with persistent cache
RUN --mount=type=cache,target=/root/.m2 \
    cd /app/common-models && \
    ./mvnw -q clean install -DskipTests && \
    cd /app/admin-service && \
    ./mvnw -q clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/admin-service/target/*.jar app.jar

# Expose Admin Service port
EXPOSE 8030

# Run the application
ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]

