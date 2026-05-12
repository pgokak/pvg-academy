---
title: "Project Structure & Auto-configuration"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```xml
<!-- Spring 2.x — 50+ lines of XML just to set up a datasource -->
<beans xmlns="http://www.springframework.org/schema/beans">
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
        <property name="username" value="root"/>
        <property name="password" value="secret"/>
        <property name="maxActive" value="20"/>
        <property name="maxIdle" value="5"/>
    </bean>
    <bean id="entityManagerFactory" class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <property name="packagesToScan" value="com.example.model"/>
        <!-- ... 30 more lines -->
    </bean>
    <bean id="transactionManager" .../>
    <!-- ... more beans -->
</beans>
```

Every project needed hundreds of lines of boilerplate configuration before writing a single line of business logic.

## Mental Model

Spring Boot is an opinionated starter kit. It looks at what's on your classpath and configures things automatically — you opt out of what you don't want, rather than opting in to everything. Add a JDBC driver? Spring Boot configures a DataSource. Add spring-boot-starter-web? Spring Boot starts an embedded Tomcat on port 8080.

## @SpringBootApplication — Three Annotations in One

```java
@SpringBootApplication
// is equivalent to:
@Configuration         // This class can define @Bean methods
@EnableAutoConfiguration  // Let Spring Boot guess and configure based on classpath
@ComponentScan         // Scan this package and sub-packages for @Component/@Service/etc.
public class IssueTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(IssueTrackerApplication.class, args);
    }
}
```

## Spring Starters

Starters are curated dependency bundles. Add one, get everything you need:

| Starter                          | What it gives you                               |
| -------------------------------- | ----------------------------------------------- |
| `spring-boot-starter-web`        | Embedded Tomcat, Spring MVC, Jackson JSON       |
| `spring-boot-starter-data-jpa`   | Hibernate, Spring Data JPA, transaction support |
| `spring-boot-starter-security`   | Spring Security, filters, password encoding     |
| `spring-boot-starter-validation` | Hibernate Validator, Bean Validation API        |
| `spring-boot-starter-test`       | JUnit 5, Mockito, MockMvc, TestRestTemplate     |

## application.properties

The control panel for your application — no recompile needed:

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=postgres
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Custom properties
app.jwt.secret=mySecretKey
app.jwt.expiration=86400000
app.email.from=noreply@company.com
```

## Package Structure Convention

Spring Boot encourages a layered package structure:

```
com.example.issuetracker/
├── IssueTrackerApplication.java   ← @SpringBootApplication here
├── controller/                    ← @RestController classes
│   └── UserController.java
├── service/                       ← @Service classes
│   └── UserService.java
├── repository/                    ← @Repository / JpaRepository interfaces
│   └── UserRepository.java
├── model/                         ← @Entity classes (database tables)
│   └── User.java
├── dto/                           ← Request/Response objects (not entities)
│   ├── CreateUserRequest.java
│   └── UserResponse.java
├── config/                        ← @Configuration classes
│   └── SecurityConfig.java
└── exception/                     ← Custom exceptions + @ControllerAdvice
    └── GlobalExceptionHandler.java
```

The `@SpringBootApplication` class must be at the root package — component scanning walks DOWN from there.

## Common Mistake

Putting `@SpringBootApplication` inside a sub-package — Spring's component scan won't reach sibling packages:

```java
// WRONG — placed inside 'controller' package
// Only scans com.example.app.controller — service/repository never found!
package com.example.app.controller;

@SpringBootApplication
public class Application { ... }

// RIGHT — placed at root package
package com.example.app;

@SpringBootApplication
public class Application { ... }
// Now scans: controller/, service/, repository/, model/, etc.
```

## When to Reach For This

- Starting a new project — use Spring Initializr (start.spring.io) to generate the scaffold
- When a dependency needs configuration (security, JPA, caching) — check if a starter handles it before writing XML or `@Bean` methods
- Moving environment-specific values (DB passwords, API keys) — use `application.properties` / environment variables
- When you need behavior in only one environment — use Spring Profiles with `application-dev.properties`
- When Spring Boot's auto-configuration is wrong — use `@ConditionalOnMissingBean` or `spring.autoconfigure.exclude`
