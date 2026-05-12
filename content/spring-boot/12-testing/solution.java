// TESTING SPRING BOOT — Solution

package com.example.issuetracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// ─── Task 1: Unit test — no Spring, just Java ─────────────────────────────────
class UserServiceTest {
    // Plain Mockito mocks — no Spring needed
    private final UserRepository mockRepo = Mockito.mock(UserRepository.class);
    private final EmailService mockEmail = Mockito.mock(EmailService.class);

    // Instantiate directly via constructor — tests it the same way production does
    private final UserService userService = new UserService(mockRepo, mockEmail);

    @Test
    void create_savesUserAndSendsWelcomeEmail() {
        // Arrange
        var req = new CreateUserRequest("Alice", "alice@example.com", "Pass1234!");
        var savedUser = new User(1L, "Alice", "alice@example.com");

        when(mockRepo.existsByEmail("alice@example.com")).thenReturn(false);
        when(mockRepo.save(any(User.class))).thenReturn(savedUser);

        // Act
        UserResponse result = userService.create(req);

        // Assert
        assertNotNull(result);
        assertEquals("Alice", result.name());
        verify(mockEmail).sendWelcome("alice@example.com"); // Called exactly once
        verify(mockRepo).save(any(User.class));
    }

    @Test
    void create_throwsConflict_whenEmailAlreadyExists() {
        // Arrange
        when(mockRepo.existsByEmail("alice@example.com")).thenReturn(true);
        var req = new CreateUserRequest("Alice", "alice@example.com", "Pass1234!");

        // Act & Assert
        assertThrows(ConflictException.class, () -> userService.create(req));
        verifyNoInteractions(mockEmail); // Email service should never be called
    }
}

// ─── Task 2: @WebMvcTest — web layer only ────────────────────────────────────
// Only starts Spring MVC — UserService is replaced by a @MockBean
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean  // Replaces real UserService with Mockito mock in the Spring context
    private UserService userService;

    @Test
    void getUser_returns200WithUserJson() throws Exception {
        // Arrange
        var alice = new UserResponse(1L, "Alice", "alice@example.com", "USER", null);
        when(userService.findById(1L)).thenReturn(alice);

        // Act & Assert
        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Alice"))
            .andExpect(jsonPath("$.email").value("alice@example.com"))
            .andExpect(jsonPath("$.password").doesNotExist()); // Verify no password leak
    }

    @Test
    void createUser_returns400_whenNameBlank() throws Exception {
        // Blank name should fail @NotBlank validation
        String invalidBody = """
            {
              "name": "",
              "email": "alice@example.com",
              "password": "Pass1234!"
            }
            """;

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidBody))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.name").exists()); // Field error for 'name'

        verifyNoInteractions(userService); // Validation failed — service never called
    }
}

// ─── Task 3: @DataJpaTest — JPA layer only ───────────────────────────────────
// Starts only the JPA layer — H2 in-memory DB, @Transactional rolls back after each test
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_returnsUser_whenSaved() {
        // Arrange — save via Spring Data
        User user = new User("Alice", "alice@example.com");
        userRepository.save(user);

        // Act
        Optional<User> found = userRepository.findByEmail("alice@example.com");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Alice", found.get().getName());
        assertNotNull(found.get().getId()); // ID was generated
    }

    @Test
    void findByEmail_returnsEmpty_whenNotSaved() {
        Optional<User> found = userRepository.findByEmail("nobody@example.com");
        assertTrue(found.isEmpty());
    }

    @Test
    void existsByEmail_returnsFalse_forUnknownEmail() {
        assertFalse(userRepository.existsByEmail("nobody@example.com"));
    }

    @Test
    void existsByEmail_returnsTrue_afterSaving() {
        userRepository.save(new User("Bob", "bob@example.com"));
        assertTrue(userRepository.existsByEmail("bob@example.com"));
    }
}
