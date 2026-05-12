// DEPENDENCY INJECTION IN SPRING — Solution

package com.example.issuetracker.service;

import com.example.issuetracker.dto.CreateUserRequest;
import com.example.issuetracker.dto.UserResponse;
import com.example.issuetracker.exception.ResourceNotFoundException;
import com.example.issuetracker.model.User;
import com.example.issuetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

// ─── Task 1: Interface ────────────────────────────────────────────────────────
public interface NotificationService {
    void sendWelcome(String email);
    void sendReset(String email);
}

// ─── Task 2: Email implementation ────────────────────────────────────────────
@Service("emailNotification")
public class EmailNotificationService implements NotificationService {
    @Override
    public void sendWelcome(String email) {
        System.out.println("[EMAIL] Sending welcome email to: " + email);
        // Production: JavaMailSender or similar
    }

    @Override
    public void sendReset(String email) {
        System.out.println("[EMAIL] Sending password reset to: " + email);
    }
}

// ─── Task 3: SMS implementation ──────────────────────────────────────────────
@Service("smsNotification")
public class SmsNotificationService implements NotificationService {
    @Override
    public void sendWelcome(String email) {
        System.out.println("[SMS] Welcome SMS triggered for account: " + email);
        // Production: Twilio or similar
    }

    @Override
    public void sendReset(String email) {
        System.out.println("[SMS] Reset SMS triggered for: " + email);
    }
}

// ─── Task 4: Properly injected UserService ────────────────────────────────────
@Service
public class UserService {
    // Fields are final — set once via constructor, never changed
    // Depends on the INTERFACE, not the concrete class
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // @Qualifier tells Spring which NotificationService implementation to inject
    // when there are multiple beans of the same type
    public UserService(
            UserRepository userRepository,
            @Qualifier("emailNotification") NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public UserResponse registerUser(CreateUserRequest request) {
        User user = new User(request.name(), request.email());
        User saved = userRepository.save(user);
        notificationService.sendWelcome(saved.getEmail());
        return UserResponse.from(saved);
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        notificationService.sendReset(user.getEmail());
    }
}

// ─── Task 5: Unit test — no Spring context needed ─────────────────────────────
/*
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.mockito.Mockito.*;

class UserServiceTest {

    // Create mocks — lightweight substitutes that record method calls
    private final UserRepository mockRepo = Mockito.mock(UserRepository.class);
    private final NotificationService mockNotification = Mockito.mock(NotificationService.class);

    // Inject via constructor — same pattern as Spring, but no Spring context
    private final UserService userService = new UserService(mockRepo, mockNotification);

    @Test
    void registerUser_savesUserAndSendsWelcomeEmail() {
        // Arrange
        var request = new CreateUserRequest("Alice", "alice@example.com", "password123");
        var savedUser = new User(1L, "Alice", "alice@example.com");
        when(mockRepo.save(any())).thenReturn(savedUser);

        // Act
        UserResponse response = userService.registerUser(request);

        // Assert
        assertEquals("Alice", response.name());
        verify(mockNotification).sendWelcome("alice@example.com"); // was it called?
        verify(mockRepo).save(any(User.class));
    }

    @Test
    void initiatePasswordReset_throwsWhenUserNotFound() {
        when(mockRepo.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
            userService.initiatePasswordReset("unknown@example.com"));

        verifyNoInteractions(mockNotification); // no notification if user not found
    }
}
*/
