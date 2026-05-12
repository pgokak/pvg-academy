// TESTING SPRING BOOT — Starter Exercise
//
// TASK: Write three types of tests for the user management feature.
//
// YOUR TASKS:
// 1. Write a unit test for UserService.create() — no Spring, use Mockito
//    - Test: happy path creates user and sends welcome email
//    - Test: throws ConflictException when email already exists
//
// 2. Write a @WebMvcTest for UserController — test HTTP layer only
//    - Test: GET /api/users/1 returns 200 with correct JSON
//    - Test: POST /api/users with missing name returns 400
//
// 3. Write a @DataJpaTest for UserRepository
//    - Test: save and findByEmail works
//    - Test: existsByEmail returns false for unknown email

package com.example.issuetracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// ─── Task 1: Unit test — no Spring ───────────────────────────────────────────
class UserServiceTest {
    // TODO: Create Mockito mocks for UserRepository and EmailService
    // TODO: Instantiate UserService via constructor with mocks

    @Test
    void create_savesUserAndSendsWelcomeEmail() {
        // TODO: Arrange — stub mockRepo.existsByEmail() to return false
        //               — stub mockRepo.save() to return a saved user
        // TODO: Act — call userService.create(new CreateUserRequest(...))
        // TODO: Assert — verify mockEmail.sendWelcome() was called
    }

    @Test
    void create_throwsConflict_whenEmailAlreadyExists() {
        // TODO: Arrange — stub mockRepo.existsByEmail() to return true
        // TODO: Assert — assertThrows ConflictException
        // TODO: Assert — verifyNoInteractions(mockEmail)
    }
}

// ─── Task 2: Web layer test ───────────────────────────────────────────────────
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // TODO: Add @MockBean for UserService

    @Test
    void getUser_returns200WithUserJson() throws Exception {
        // TODO: stub userService.findById(1L) to return a UserResponse
        // TODO: mockMvc.perform(get("/api/users/1"))
        //              .andExpect(status().isOk())
        //              .andExpect(jsonPath("$.name").value("Alice"))
    }

    @Test
    void createUser_returns400_whenNameBlank() throws Exception {
        // TODO: perform POST with body { "name": "", "email": "a@b.com", "password": "Pass123!" }
        // TODO: expect status().isBadRequest()
    }
}

// ─── Task 3: JPA layer test ───────────────────────────────────────────────────
@DataJpaTest
class UserRepositoryTest {

    // TODO: @Autowired UserRepository

    @Test
    void findByEmail_returnsUser_whenSaved() {
        // TODO: create and save a User
        // TODO: call findByEmail()
        // TODO: assert the result is present and has correct name
    }

    @Test
    void existsByEmail_returnsFalse_forUnknownEmail() {
        // TODO: call existsByEmail("nobody@example.com")
        // TODO: assertFalse
    }
}
