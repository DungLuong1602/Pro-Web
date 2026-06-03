# Pro-Web
# Local Spotify

## 1. Project Title and Description
**Local Spotify** is a lightweight, self-hosted music streaming web application. It empowers users to securely upload, manage, and stream their personal `.mp3` audio collections over a local network without relying on external internet connectivity or paid cloud subscriptions. The platform features seamless background playback using a Single Page Application (SPA) architecture, custom playlist curation, and social interactions like commenting and liking songs.

## 2. Team Members and Roles
This project was developed for the Web Application Development course by the following team members:
* **Nguyễn Nhật Nam** - Team Leader (Full-stack Development & Architecture)
* **Lương Nguyễn Tấn Dũng** - Team Member (Backend APIs & Database Integration)
* **Hoàng Triệu Nam** - Team Member (Frontend UI/UX & Testing)

## 3. Technology Stack
* **Backend:** Java Spring Boot (RESTful Web Services)
* **Frontend:** Vanilla HTML5, CSS3, and JavaScript (SPA Architecture)
* **Database:** MySQL (Relational Data Mapping via Spring Data JPA / Hibernate)
* **Build Tool:** Apache Maven
* **Storage:** Local File System (Absolute path binary storage for media files)

## 4. Prerequisites
To run this project locally, ensure you have the following installed on your machine:
* **Java Development Kit (JDK):** Version 17 or higher
* **MySQL Server:** Version 8.0 or higher
* **Maven:** Version 3.8+ (Optional, as the project includes a Maven Wrapper `mvnw`)
* **IDE:** IntelliJ IDEA, Eclipse, or VS Code
* **Web Browser:** Google Chrome, Firefox, or Edge (for frontend access)

## 5. Step-by-Step Setup Instructions

**Step 1: Clone the repository**
git clone [https://github.com/your-username/local-spotify.git](https://github.com/your-username/local-spotify.git)
cd local-spotify
Step 2: Database Setup
Log into your local MySQL server and create a dedicated database for the application:

SQL
CREATE DATABASE local_spotify_db;
(Note: You do not need to manually create tables. Spring Boot Hibernate is configured to automatically generate the schema upon startup).

Step 3: Configure Media Storage
Create an absolute directory on your local machine to store the uploaded .mp3 files safely outside the project workspace to prevent data loss during builds.

Example for Windows: C:/local_spotify_data/audio

Example for macOS/Linux: /Users/yourusername/local_spotify_data/audio

Step 4: Update Application Properties
Navigate to src/main/resources/application.properties and update the configuration to match your local environment.

6. Environment Variables Needed
You can set these directly in your application.properties file or inject them into your system environment variables before running the application:

Properties
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/local_spotify_db
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password

# Hibernate Configuration (Set to 'update' to auto-sync schema without dropping data)
HIBERNATE_DDL_AUTO=update

# File Storage Configuration (Use the path created in Step 3)
UPLOAD_DIR=C:/local_spotify_data/audio

# Max Upload Sizes
MAX_FILE_SIZE=20MB
MAX_REQUEST_SIZE=20MB
7. How to Run Locally
Running the Backend Server:
Open your terminal in the root project directory (where the pom.xml is located) and execute the following command using the Maven Wrapper:

On Windows:

DOS
mvnw.cmd spring-boot:run
On macOS/Linux:

Bash
./mvnw spring-boot:run
The Spring Boot server will start on http://localhost:8080.

Running the Frontend Client:
Because the frontend uses Vanilla HTML/JS, no build step (like Node/NPM) is required.

Use an extension like Live Server in VS Code.

Right-click index.html and select "Open with Live Server".

Navigate to http://localhost:5500 (or the port Live Server provides) in your browser.
