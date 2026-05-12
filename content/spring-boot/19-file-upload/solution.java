// FILE UPLOAD & DOWNLOAD — Solution

package com.example.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final long MAX_SIZE = 5L * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png");

    private final Path uploadDir;

    public FileController(@Value("${app.upload-dir:uploads}") String uploadDir) throws IOException {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    // Task 3: Validated upload with UUID filename
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file)
        throws IOException {

        // Task 1: Validate before doing anything with the file
        validateFile(file);

        // Task 2: UUID-based filename — never store the original filename on disk
        String storedFilename = buildStorageFilename(file);

        // Resolve and normalize — verify path stays inside uploadDir (path traversal guard)
        Path targetPath = uploadDir.resolve(storedFilename).normalize();
        if (!targetPath.startsWith(uploadDir)) {
            throw new SecurityException("Path traversal attempt detected");
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Return the UUID filename — store this in the database to reference later
        return ResponseEntity.ok(storedFilename);
    }

    // Task 4: Stream the file back with correct headers
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename)
        throws IOException {

        // Resolve and normalize — prevent path traversal on download too
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!filePath.startsWith(uploadDir)) {
            throw new SecurityException("Path traversal attempt detected");
        }

        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        // Detect actual content type from file bytes, not from client declaration
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            // "inline" — browser renders (images, PDF); use "attachment" to force download
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"" + resource.getFilename() + "\"")
            .body(resource);
    }

    // Task 1: Validation — reject before reading any bytes
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("No file submitted");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException(
                "File size " + file.getSize() + " exceeds 5 MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                "File type not allowed: " + contentType + ". Allowed: " + ALLOWED_TYPES);
        }
    }

    // Task 2: UUID filename — safe storage name that prevents path traversal and collisions
    private String buildStorageFilename(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = "." + originalFilename.substring(originalFilename.lastIndexOf('.') + 1);
        }
        // UUID ensures: no collisions, no path traversal, no user-controlled characters
        return UUID.randomUUID() + extension;
    }
}

// ─── application.yml ──────────────────────────────────────────────────────────
// Task 5: Add to src/main/resources/application.yml
//
// spring:
//   servlet:
//     multipart:
//       max-file-size: 5MB
//       max-request-size: 20MB
//       enabled: true
//
// app:
//   upload-dir: uploads
