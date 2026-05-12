// FILE UPLOAD & DOWNLOAD — Starter Exercise
//
// SCENARIO: A FileController and FileStorageService for uploading and serving files.
// The current implementation has security holes and missing validation.
//
// YOUR TASKS:
// 1. Add file validation (size ≤ 5MB, content type must be image/jpeg or image/png)
// 2. Replace getOriginalFilename() with a UUID-based filename to prevent path traversal
// 3. Complete the upload endpoint — validate, store with UUID name, return stored filename
// 4. Complete the download endpoint — load the file as a Resource, return with proper headers
// 5. Add multipart size limits in application.yml (shown as a comment at the bottom)

package com.example.app.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final Path uploadDir;

    public FileController(@Value("${app.upload-dir:uploads}") String uploadDir) throws IOException {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    // TODO 3: Complete this upload endpoint
    // Steps:
    //   a) TODO 1: Validate the file (reject if empty, > 5MB, or wrong content type)
    //   b) TODO 2: Generate a UUID filename — DO NOT use getOriginalFilename() directly
    //   c) Copy the file stream to uploadDir/UUID-filename
    //   d) Return 200 with the stored filename
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file)
        throws IOException {

        // BUG: Using original filename — path traversal vulnerability!
        String filename = file.getOriginalFilename();
        Path target = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), target);

        return ResponseEntity.ok("Uploaded: " + filename);
    }

    // TODO 4: Complete this download endpoint
    // Steps:
    //   a) Resolve the filename against uploadDir and normalize
    //   b) Create a UrlResource from the path
    //   c) Check that the resource exists and is readable
    //   d) Detect content type using Files.probeContentType()
    //   e) Return with Content-Disposition header (inline) and correct Content-Type
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename)
        throws IOException {

        // TODO: Implement download
        return ResponseEntity.notFound().build();
    }

    // Helper: validate file before storing
    private void validateFile(MultipartFile file) {
        // TODO 1a: Reject if file is empty
        // TODO 1b: Reject if file size > 5MB (5 * 1024 * 1024 bytes)
        // TODO 1c: Reject if content type is not image/jpeg or image/png
    }

    // Helper: generate a safe storage filename using UUID + original extension
    private String buildStorageFilename(MultipartFile file) {
        // TODO 2: Extract extension from getOriginalFilename()
        // Build: UUID.randomUUID() + "." + extension
        // Return the safe filename
        return file.getOriginalFilename(); // WRONG — replace this
    }
}

// ─── application.yml additions (add to your application.yml, not here) ────────
// TODO 5:
// spring:
//   servlet:
//     multipart:
//       max-file-size: 5MB
//       max-request-size: 20MB
