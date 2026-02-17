# Build stage
FROM eclipse-temurin:21-jdk-jammy as builder
WORKDIR /app

# Copy Maven wrapper
COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/

# Copy pom.xml for dependency caching
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw dependency:go-offline -DskipTests

# Copy source code and build
COPY src src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose Eureka Server port
EXPOSE 8761

# Run the application
ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]
