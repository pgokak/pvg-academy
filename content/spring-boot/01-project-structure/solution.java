// PROJECT STRUCTURE & AUTO-CONFIGURATION — Solution

// Fix 1: Correct package — root of the application, not inside a sub-package
// Component scanning walks DOWN from this package, so all sub-packages are discovered
package com.example.issuetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Fix 2: @SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan
// This single annotation bootstraps the entire Spring application
@SpringBootApplication
public class IssueTrackerApplication {

    public static void main(String[] args) {
        // SpringApplication.run() starts the embedded server and Spring context
        SpringApplication.run(IssueTrackerApplication.class, args);
    }
}

// ─── Fix 3: Remove manual Jackson configuration ───────────────────────────────
// spring-boot-starter-web already configures Jackson with sensible defaults.
// The @Configuration class below is unnecessary and was replaced by:
//
// spring.jackson.serialization.write-dates-as-timestamps=false
//
// In application.properties. Spring Boot auto-configuration handles this.

// ─── Fix 4: application.properties ───────────────────────────────────────────
/*
Contents of src/main/resources/application.properties:

# Server
server.port=9090
server.servlet.context-path=/api/v1

# PostgreSQL DataSource
spring.datasource.url=jdbc:postgresql://localhost:5432/issuedb
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:secret}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# Jackson
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.default-property-inclusion=non_null
*/

// ─── Fix 5: pom.xml starters ─────────────────────────────────────────────────
/*
<dependencies>
    <!-- REST endpoints: Embeds Tomcat, adds Spring MVC, Jackson JSON -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- PostgreSQL: Spring Data JPA + Hibernate + connection pooling (HikariCP) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Bean Validation: @NotNull, @Email, @Size, @Valid etc. -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Testing: JUnit 5, Mockito, MockMvc, TestRestTemplate -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
*/

// ─── Correct package structure ────────────────────────────────────────────────
/*
com.example.issuetracker/               ← @SpringBootApplication lives here
├── IssueTrackerApplication.java
├── controller/
│   ├── UserController.java             ← @RestController
│   └── IssueController.java
├── service/
│   ├── UserService.java                ← @Service
│   └── IssueService.java
├── repository/
│   ├── UserRepository.java             ← extends JpaRepository
│   └── IssueRepository.java
├── model/
│   ├── User.java                       ← @Entity
│   └── Issue.java
├── dto/
│   ├── CreateUserRequest.java          ← record with @Valid annotations
│   └── UserResponse.java
├── config/
│   └── SecurityConfig.java             ← @Configuration for Spring Security
└── exception/
    ├── ResourceNotFoundException.java  ← extends RuntimeException
    └── GlobalExceptionHandler.java     ← @ControllerAdvice
*/
