---
title: "File Upload & Download"
version: "Spring Boot 3.x"
since: 2014
stable: true
---

## The Problem

```java
@RestController
public class AvatarController {

    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file) throws IOException {
        // Storing directly to local disk using the ORIGINAL filename
        Path target = Paths.get("/var/app/uploads/" + file.getOriginalFilename());
        Files.copy(file.getInputStream(), target);

        // Problems:
        // 1. Original filename stored in DB — path traversal risk
        // 2. Files live on the server's local disk — lost on redeploy, breaks with multiple instances
        // 3. No size or type validation — attacker uploads 2GB .exe
        // 4. No overwrite protection — second upload with same name silently replaces the first
        return "Uploaded: " + file.getOriginalFilename();
    }
}
```

Works in dev, breaks the moment you deploy to a container or a second server instance.

## Mental Model

Files need a home separate from your app. Your app receives the file, stores it somewhere stable (disk, S3), and saves only the address (path or URL) in the database. The app itself stays stateless — any instance can serve any request.

## Receiving the File — MultipartFile

```java
@RestController
@RequestMapping("/files")
public class FileController {

    // consumes = MULTIPART_FORM_DATA_VALUE tells Spring to parse the multipart body
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileResponse> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam("description") String description) {

        // MultipartFile gives you:
        // file.getOriginalFilename()  — name the user gave the file (UNTRUSTED)
        // file.getContentType()       — MIME type declared by the client (UNTRUSTED)
        // file.getSize()              — file size in bytes
        // file.getInputStream()       — the actual bytes
        // file.isEmpty()              — true if no file was submitted

        return ResponseEntity.ok(/* save and return response */);
    }
}
```

## File Validation

```java
private void validateFile(MultipartFile file) {
    if (file.isEmpty()) {
        throw new BadRequestException("No file submitted");
    }

    // Size check — reject before reading content
    long maxSize = 10 * 1024 * 1024;  // 10 MB
    if (file.getSize() > maxSize) {
        throw new BadRequestException("File exceeds 10 MB limit");
    }

    // Content type check — client-declared, can be spoofed
    // For serious validation, use Apache Tika to sniff actual bytes
    String contentType = file.getContentType();
    List<String> allowedTypes = List.of("image/jpeg", "image/png", "image/webp", "application/pdf");
    if (contentType == null || !allowedTypes.contains(contentType)) {
        throw new BadRequestException("File type not allowed: " + contentType);
    }
}
```

## Storing to the Local Filesystem (with UUID filename)

```java
@Service
public class LocalFileStorageService {

    private final Path uploadDir;

    public LocalFileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String store(MultipartFile file) throws IOException {
        // Generate a UUID-based filename — never use originalFilename directly
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String storedFilename = UUID.randomUUID() + (extension != null ? "." + extension : "");

        Path targetPath = uploadDir.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return storedFilename;  // Store this in the database
    }
}
```

## Serving Files Back — Resource + Content-Disposition

```java
@GetMapping("/{filename:.+}")
public ResponseEntity<Resource> downloadFile(@PathVariable String filename) throws IOException {
    Path filePath = uploadDir.resolve(filename).normalize();
    Resource resource = new UrlResource(filePath.toUri());

    if (!resource.exists() || !resource.isReadable()) {
        throw new ResourceNotFoundException("File not found: " + filename);
    }

    String contentType = Files.probeContentType(filePath);
    if (contentType == null) {
        contentType = "application/octet-stream";
    }

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        // inline: browser renders it (images, PDF)
        // attachment: browser prompts download
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
        .body(resource);
}
```

## Size Limits in application.yml

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB # Per-file limit
      max-request-size: 50MB # Total request limit (multiple files)
      enabled: true
```

## S3 Upload Pattern

Swap the storage implementation — the controller stays the same:

```java
@Service
public class S3FileStorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public String store(MultipartFile file) throws IOException {
        String key = "uploads/" + UUID.randomUUID() + getExtension(file);

        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(file.getContentType())
            .build();

        s3Client.putObject(request,
            RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return the S3 key or public URL — store this in the DB
        return "https://" + bucketName + ".s3.amazonaws.com/" + key;
    }
}
```

## Common Mistake

Using `getOriginalFilename()` directly as the stored path — path traversal vulnerability:

```java
// DANGEROUS — attacker sends filename: "../../etc/passwd" or "../app.jar"
String storedPath = uploadDir + "/" + file.getOriginalFilename();
Files.copy(file.getInputStream(), Paths.get(storedPath));
// Attacker overwrites arbitrary files on your server

// RIGHT — always use a UUID. Never trust the client-supplied filename.
String safeFilename = UUID.randomUUID() + ".jpg";
Path targetPath = uploadDir.resolve(safeFilename).normalize();
// Verify the resolved path is still inside uploadDir before writing
if (!targetPath.startsWith(uploadDir)) {
    throw new SecurityException("Path traversal detected");
}
```

## When to Reach For This

- User profile photos, document uploads, CSV imports
- Any time you need to accept binary data from a client
- When you need to serve large files efficiently (stream via Resource, not byte[])
- Multi-file upload forms (use `List<MultipartFile>`)
- When moving from local storage to S3 (keep the controller unchanged, swap the storage service)
