// DEPENDENCY INJECTION IN SPRING — Starter Exercise
//
// TASK: Refactor UserService to use constructor injection and program to interfaces.
//
// YOUR TASKS:
// 1. Create a NotificationService interface with sendWelcome(String email) and sendReset(String email)
// 2. Create EmailNotificationService implementing NotificationService (mark as @Service)
// 3. Create SmsNotificationService implementing NotificationService (mark as @Service)
// 4. Refactor UserService to:
//    a. Remove the 'new' calls — receive dependencies via constructor
//    b. Depend on the NotificationService interface, not the concrete class
//    c. Add @Qualifier to specify which NotificationService to inject
// 5. Show how you would write a unit test for UserService using a mock

package com.example.issuetracker.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

// ─── Task 1: Interface ────────────────────────────────────────────────────────
// TODO: Define NotificationService interface

// ─── Task 2: Email implementation ────────────────────────────────────────────
// TODO: Create EmailNotificationService
// @Service("emailNotification")
// public class EmailNotificationService implements NotificationService { ... }

// ─── Task 3: SMS implementation ──────────────────────────────────────────────
// TODO: Create SmsNotificationService
// @Service("smsNotification")
// public class SmsNotificationService implements NotificationService { ... }

// ─── Task 4: Fix UserService ──────────────────────────────────────────────────
@Service
public class UserService {

    // PROBLEM: tight coupling — creating own dependencies
    private final UserRepository userRepository = new UserRepository();
    private final EmailNotificationService notificationService = new EmailNotificationService();

    // TODO: Replace the above fields with properly injected dependencies
    // - Inject UserRepository via constructor
    // - Inject NotificationService interface via constructor with @Qualifier("emailNotification")

    public UserResponse registerUser(CreateUserRequest request) {
        User user = new User(request.name(), request.email());
        User saved = userRepository.save(user);
        notificationService.sendWelcome(saved.getEmail()); // should use injected service
        return UserResponse.from(saved);
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        notificationService.sendReset(user.getEmail());
    }
}

// ─── Task 5: Unit test sketch ─────────────────────────────────────────────────
// Show (in comments) how you'd write a JUnit test for UserService
// using constructor injection with mocks — no Spring context needed
//
// class UserServiceTest {
//     @Test
//     void registerUser_sendsWelcomeNotification() {
//         // TODO: create mock UserRepository and mock NotificationService
//         // TODO: instantiate UserService with mocks via constructor
//         // TODO: call registerUser()
//         // TODO: verify notificationService.sendWelcome() was called
//     }
// }
