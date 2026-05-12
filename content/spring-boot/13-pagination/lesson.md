---
title: "Pagination & Sorting"
version: "Spring Boot 3.x"
since: 2011
stable: true
---

## The Problem

```java
@GetMapping("/users")
public List<User> getAllUsers() {
    return userRepository.findAll(); // Returns all 2 million rows
    // Client receives 200MB of JSON
    // Database loads everything into memory
    // Server runs out of heap
    // Response takes 45 seconds
    // Client can't render it anyway
}
```

Returning all records for any reasonably sized dataset is catastrophic. Pagination is not optional at scale.

## Mental Model

Pagination is a library catalog, not a pile of books. You request shelf 3, books 20-40 — the library doesn't dump every book on the floor. The catalog tells you how many shelves exist so you can build navigation.

## Pageable — The Request

```java
// PageRequest.of(pageNumber, pageSize, sort)
// Pages are ZERO-indexed: page 0 = first page

Pageable firstPage = PageRequest.of(0, 10);                          // page 0, 10 items
Pageable sortedByName = PageRequest.of(0, 10, Sort.by("name"));      // sorted ascending
Pageable descByDate = PageRequest.of(1, 20,                          // page 1
    Sort.by(Sort.Direction.DESC, "createdAt"));                       // newest first
```

## Page<T> — The Response

```java
// Page<T> contains both the data and metadata
Page<User> page = userRepository.findAll(PageRequest.of(0, 10));

page.getContent();        // List<User> — the actual data for this page
page.getTotalElements();  // long — total records in the database
page.getTotalPages();     // int — total pages at this page size
page.getNumber();         // int — current page number (0-indexed)
page.getSize();           // int — page size requested
page.hasNext();           // boolean — is there a next page?
page.hasPrevious();       // boolean — is there a previous page?
page.isFirst();           // boolean
page.isLast();            // boolean
```

## Repository with Pagination

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Built-in: findAll(Pageable) — no code needed

    // Custom query + pagination
    Page<User> findByRole(String role, Pageable pageable);

    // With @Query + pagination
    @Query("SELECT u FROM User u WHERE u.active = true")
    Page<User> findAllActive(Pageable pageable);
}
```

## Controller with Pagination

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    // @PageableDefault sets defaults if client doesn't specify
    @GetMapping
    public Page<UserResponse> getUsers(
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return userService.findAll(pageable)
            .map(UserResponse::from);  // Page.map() transforms content, preserves metadata
    }

    @GetMapping("/by-role")
    public Page<UserResponse> getUsersByRole(
            @RequestParam String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return userService.findByRole(role, pageable);
    }
}
// GET /api/users?page=2&size=10&sort=name,desc
```

## Common Mistake

Returning all records and paginating in memory — this loads everything into the server:

```java
// WRONG — fetches ALL users, then skips/limits in code
@GetMapping("/users")
public List<User> getUsers(@RequestParam int page, @RequestParam int size) {
    List<User> all = userRepository.findAll(); // Loads everything from DB
    return all.subList(page * size, Math.min((page + 1) * size, all.size()));
}

// RIGHT — database does the pagination
@GetMapping("/users")
public Page<UserResponse> getUsers(@PageableDefault(size = 20) Pageable pageable) {
    return userRepository.findAll(pageable).map(UserResponse::from);
    // SQL: SELECT * FROM users ORDER BY name LIMIT 20 OFFSET 0
}
```

## When to Reach For This

- Any endpoint that returns a list of records — always paginate
- When the client needs to build navigation UI — `Page<T>` metadata gives totalPages and hasNext
- When sorting is required — `Sort.by()` or client-driven `?sort=field,direction`
- When filtering + paginating — combine `findByRole(role, pageable)` for both
- When building search results, user lists, product catalogs — default page size of 20-50 is typical
