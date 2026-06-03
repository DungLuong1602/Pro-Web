# Giai đoạn 1: Build (Đóng gói) ứng dụng bằng Maven
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
# Copy pom.xml và build trước để tận dụng cache (tăng tốc độ build)
COPY pom.xml .
RUN mvn dependency:go-offline
# Copy source code
COPY src ./src
# Build ra file .jar
RUN mvn clean package -DskipTests

# Giai đoạn 2: Run (Chạy) ứng dụng với môi trường Java siêu nhẹ
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Lấy file .jar từ giai đoạn 1
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080
EXPOSE 8080

# Lệnh khởi động (Bỏ dấu phẩy ở cuối!)
ENTRYPOINT ["java", "-jar", "app.jar"]