---
title: "Testing Spring Boot"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```java
// One test class, starts full Spring context + connects to DB for every test
@SpringBootTest
class UserTest {
    @Test void testEmailFormat() { /* Just checking a regex — starts Tomcat for this?! */ }
    @Test void testNameTrimming() { /* Pure logic — why does this need Spring? */ }
    @Test void testGetUserEndpoint() { /* This one actually needs the web layer */ }
}
// 45 seconds to start. 200 tests × 45s = 2.5 hours. Nobody runs the tests.
```

When every test starts the full application, test suites become too slow to run. Developers skip them.

## Mental Model

Test layers like an onion. Unit tests at the core — fast, no Spring, just logic. Slice tests in the middle — only the layer you're testing. Integration tests on the outside — full Spring, used sparingly. Write more small tests, fewer big ones.

## Unit Tests — No Spring Needed

```java
// Pure unit test — no Spring context, no annotations, just Java
class UserServiceTest {
    private UserRepository mockRepo = Mockito.mock(UserRepository.class);
    private EmailService mockEmail = Mockito.mock(EmailService.class);

    private UserService userService = new UserService(mockRepo, mockEmail);

    @Test
    void createUser_sendsWelcomeEmail() {
        CreateUserRequest req = new CreateUserRequest("Alice", "alice@example.com", "pass123!");
        User savedUser = new User(1L, "Alice", "alice@example.com");
        when(mockRepo.existsByEmail("alice@example.com")).thenReturn(false);
        when(mockRepo.save(any())).thenReturn(savedUser);

        userService.create(req);

        verify(mockEmail).sendWelcome("alice@example.com");
    }

    @Test
    void createUser_throwsConflict_whenEmailExists() {
        when(mockRepo.existsByEmail("alice@example.com")).thenReturn(true);
        assertThrows(ConflictException.class, () ->
            userService.create(new CreateUserRequest("Alice", "alice@example.com", "pass")));
        verifyNoInteractions(mockEmail);
    }
}
```

## @WebMvcTest — Web Layer Only

```java
// Starts only Spring MVC — no JPA, no service beans (unless provided)
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;  // Simulates HTTP without a real server

    @MockBean  // Replaces real UserService with a Mockito mock in the context
    private UserService userService;

    @Test
    void getUser_returns200_withUserJson() throws Exception {
        UserResponse alice = new UserResponse(1L, "Alice", "alice@example.com", "USER", null);
        when(userService.findById(1L)).thenReturn(alice);

        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"))
            .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    void createUser_returns400_whenNameBlank() throws Exception {
        String invalidBody = """{ "name": "", "email": "a@b.com", "password": "pass12345!" }""";
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidBody))
            .andExpect(status().isBadRequest());
    }
}
```

## @DataJpaTest — JPA Layer Only

```java
// Starts only JPA — in-memory H2 DB, no web layer, no services
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_returnsUser_whenExists() {
        User user = new User("Alice", "alice@example.com");
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("alice@example.com");

        assertTrue(found.isPresent());
        assertEquals("Alice", found.get().getName());
    }

    @Test
    void existsByEmail_returnsFalse_forUnknownEmail() {
        assertFalse(userRepository.existsByEmail("nobody@example.com"));
    }
}
```

## @SpringBootTest — Full Integration Test (Use Sparingly)

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UserIntegrationTest {
    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void fullFlow_createAndRetrieveUser() {
        // Actually starts the server, makes real HTTP calls
        var req = new CreateUserRequest("Alice", "alice@example.com", "Pass1234!");
        var created = restTemplate.postForEntity("/api/users", req, UserResponse.class);
        assertEquals(201, created.getStatusCodeValue());
        // ...
    }
}
```

## Common Mistake

Using `@SpringBootTest` for everything — the suite becomes too slow:

```
// WRONG — full Spring context for a simple logic test
@SpringBootTest  // 8 second startup per test class
class PasswordHashingTest {
    @Test void testBcryptHashing() { /* Just BCrypt.hashpw() */ }
}

// RIGHT — pure unit test, no annotations
class PasswordHashingTest {
    @Test void testBcryptHashing() {
        String hash = new BCryptPasswordEncoder().encode("password123");
        assertTrue(new BCryptPasswordEncoder().matches("password123", hash));
    }
}
// 0.05 seconds
```

## When to Reach For This

- Business logic in services — unit tests with mocks (fastest)
- Controller request/response mapping, validation, error handling — `@WebMvcTest`
- Custom repository query methods — `@DataJpaTest`
- Critical user flows spanning all layers — `@SpringBootTest` for a few key scenarios
- Avoiding `@SpringBootTest` for most tests — reserve it for end-to-end flows only
