# Optimized Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the pre-built jar from the Jenkins workspace target folder
COPY target/*.jar app.jar

# UI EXCELLENCE: Minimize image size and attack surface
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]
