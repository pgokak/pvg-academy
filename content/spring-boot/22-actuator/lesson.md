---
title: "Actuator & Monitoring"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```bash
# Production is slow. You SSH into the server.
$ ps aux | grep java          # Is the process running?
$ grep ERROR app.log          # Any errors in the last hour?
$ free -m                     # How much memory is left?
$ curl localhost:8080/health  # curl: (7) Connection refused
# You have no idea what's happening inside your running app.
```

No visibility into health, memory, active beans, slow endpoints, or live configuration — until the app dies and you're left reading logs.

## Mental Model

Actuator is a cockpit dashboard for your running app. Instead of SSH-ing into the server to grep logs, you hit an endpoint and get real-time health, metrics, and config info. The app reports on itself — no external agent required.

## Dependency

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## Key Built-In Endpoints

| Endpoint                   | What it shows                                            |
| -------------------------- | -------------------------------------------------------- |
| `/actuator/health`         | UP/DOWN + component health (DB, Redis, disk)             |
| `/actuator/info`           | App metadata (version, git commit, custom info)          |
| `/actuator/metrics`        | Available metric names                                   |
| `/actuator/metrics/{name}` | Specific metric values, tags, stats                      |
| `/actuator/env`            | All config properties (redacted by default)              |
| `/actuator/beans`          | All Spring beans and their dependencies                  |
| `/actuator/loggers`        | Current log levels — can change them at runtime via POST |
| `/actuator/httptrace`      | Last 100 HTTP requests with status + duration            |
| `/actuator/threaddump`     | All running threads and their stack traces               |
| `/actuator/scheduledtasks` | All `@Scheduled` tasks registered                        |

## Exposing Endpoints

By default, only `/actuator/health` and `/actuator/info` are exposed over HTTP.

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,loggers # Expose selectively
        # include: "*"                           # Expose all (dangerous without security)
  endpoint:
    health:
      show-details: when_authorized # Show component details for authenticated users
  info:
    env:
      enabled: true # Show info.* properties in /actuator/info
```

## Custom Health Indicator

```java
@Component
public class ExternalApiHealthIndicator implements HealthIndicator {

    private final ExternalApiClient apiClient;

    public ExternalApiHealthIndicator(ExternalApiClient apiClient) {
        this.apiClient = apiClient;
    }

    @Override
    public Health health() {
        try {
            boolean alive = apiClient.ping();
            if (alive) {
                return Health.up()
                    .withDetail("url", apiClient.getBaseUrl())
                    .withDetail("status", "reachable")
                    .build();
            } else {
                return Health.down()
                    .withDetail("url", apiClient.getBaseUrl())
                    .withDetail("reason", "ping returned false")
                    .build();
            }
        } catch (Exception e) {
            return Health.down(e)
                .withDetail("url", apiClient.getBaseUrl())
                .build();
        }
    }
}
```

`/actuator/health` response with the custom indicator:

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "externalApi": {
      "status": "UP",
      "details": { "url": "https://api.partner.com", "status": "reachable" }
    },
    "diskSpace": { "status": "UP" }
  }
}
```

## Custom Info Contributor

```yaml
# application.yml — contributes to /actuator/info
info:
  app:
    name: Order Service
    version: "@project.version@" # Maven property interpolation
    description: Handles order placement and fulfillment
  contact:
    team: platform-engineering
    slack: "#platform-alerts"
```

```java
// Or programmatic info contribution
@Component
public class BuildInfoContributor implements InfoContributor {
    @Override
    public void contribute(Info.Builder builder) {
        builder.withDetail("build", Map.of(
            "javaVersion", System.getProperty("java.version"),
            "startTime", Instant.now().toString()
        ));
    }
}
```

## Querying Metrics

```bash
# List available metric names
GET /actuator/metrics

# HTTP request stats for a specific endpoint
GET /actuator/metrics/http.server.requests?tag=uri:/api/orders&tag=status:200

# Response:
# {
#   "name": "http.server.requests",
#   "measurements": [
#     { "statistic": "COUNT", "value": 1423 },
#     { "statistic": "TOTAL_TIME", "value": 142.3 },
#     { "statistic": "MAX", "value": 2.1 }
#   ]
# }

# JVM memory usage
GET /actuator/metrics/jvm.memory.used
```

## Change Log Level at Runtime

```bash
# Check current log level for a package
GET /actuator/loggers/com.example.service

# Temporarily enable DEBUG logging (no restart needed)
POST /actuator/loggers/com.example.service
Content-Type: application/json
{ "configuredLevel": "DEBUG" }

# Reset to default
POST /actuator/loggers/com.example.service
{ "configuredLevel": null }
```

## Securing Actuator Endpoints

```java
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            .requestMatchers("/actuator/**").hasRole("ADMIN")  // All others: ADMIN only
            .anyRequest().authenticated()
        );
        return http.build();
    }
}
```

## Prometheus + Grafana Integration

```xml
<!-- pom.xml — adds /actuator/prometheus endpoint -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

Prometheus scrapes `/actuator/prometheus` on a schedule. Grafana queries Prometheus to render dashboards. Your Spring Boot app needs zero Grafana/Prometheus code.

## Common Mistake

Exposing all actuator endpoints without security — `/actuator/env` shows all config properties including database passwords, API keys, and JWT secrets:

```yaml
# DANGEROUS — all endpoints exposed with no authentication
management:
  endpoints:
    web:
      exposure:
        include: "*"

# RIGHT — expose only safe endpoints publicly; protect the rest
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
# Then add SecurityConfig to restrict /actuator/** to ADMIN role
```

## When to Reach For This

- Any production deployment — `/actuator/health` is the minimum viable monitoring
- Kubernetes liveness/readiness probes — point them at `/actuator/health`
- Debugging a slow endpoint — check `/actuator/metrics/http.server.requests`
- Investigating memory leaks — `/actuator/metrics/jvm.memory.used`
- Enabling debug logging in production without a restart — POST to `/actuator/loggers`
