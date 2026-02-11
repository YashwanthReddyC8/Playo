# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy Maven wrapper
COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/

# Copy pom first (for dependency cache)
COPY pom.xml .

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw dependency:go-offline -DskipTests

# Copy source code
COPY src src

EXPOSE 5000

CMD ["./mvnw", "spring-boot:run"]