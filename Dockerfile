# Giai đoạn 1: Build (Đóng gói) ứng dụng bằng Maven
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
# Copy file cấu hình thư viện và source code vào container
COPY pom.xml .
COPY src ./src
# Chạy lệnh build ra file .jar (bỏ qua bước test để build nhanh hơn)
RUN mvn clean package -DskipTests

# Giai đoạn 2: Run (Chạy) ứng dụng với môi trường Java siêu nhẹ
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Lấy file .jar đã build thành công ở Giai đoạn 1 mang sang đây
COPY --from=build /app/target/*.jar app.jar

# Tạo sẵn thư mục uploads để Railway Volume có thể gắn (mount) vào
RUN mkdir -p /app/uploads

# Mở cổng 8080 để giao tiếp
EXPOSE 8080

# Lệnh khởi động server Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]