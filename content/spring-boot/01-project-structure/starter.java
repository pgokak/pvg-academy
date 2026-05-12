// PROJECT STRUCTURE & AUTO-CONFIGURATION — Starter Exercise
//
// TASK: Fix this Spring Boot application class and supporting configuration.
//
// YOUR TASKS:
// 1. The main class is missing @SpringBootApplication — add it
// 2. The main class is in the wrong package — it's inside 'controller' instead of root
//    (describe in a comment what the fix should be, since we can't move files here)
// 3. The SecurityConfig bean is unnecessary — Spring Boot auto-configures security
//    Comment it out and explain why
// 4. Add the missing application.properties values (in comments below)
// 5. Identify which starter dependency is missing for each feature

package com.example.issuetracker.controller; // BUG: should be com.example.issuetracker

// TODO: Add the missing annotation that combines @Configuration,
//       @EnableAutoConfiguration, and @ComponentScan
public class IssueTrackerApplication {

    public static void main(String[] args) {
        // TODO: Fix the static call to start Spring Boot
        // SpringApplication.???(IssueTrackerApplication.class, args);
    }
}

// ─── Unnecessary manual configuration ────────────────────────────────────────
// Spring Boot auto-configures all of this from spring-boot-starter-web.
// When you see this pattern, Spring Boot already does it for you.

// @Configuration  // TODO: explain in a comment why this entire class is unnecessary
// class WebMvcConfig {
//     @Bean
//     public Jackson2ObjectMapperBuilder jacksonBuilder() {
//         return new Jackson2ObjectMapperBuilder()
//             .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
//     }
// }

// ─── application.properties (add these in src/main/resources/application.properties) ──
// TODO: Add configuration for:
// 1. Change server port to 9090
// 2. Set the context path to /api/v1
// 3. Configure a PostgreSQL datasource (url: jdbc:postgresql://localhost:5432/issuedb)
// 4. Set JPA to validate schema (don't auto-create tables in production)
// 5. Disable SQL logging

// ─── Missing starters — which pom.xml dependency is needed? ──────────────────
// Feature: Making REST endpoints → Starter: spring-boot-starter-???
// Feature: Talking to PostgreSQL → Starter: spring-boot-starter-??? + postgresql driver
// Feature: @NotNull/@Email validation → Starter: spring-boot-starter-???
// Feature: Writing JUnit tests → Starter: spring-boot-starter-???
