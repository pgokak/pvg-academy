// Angular Authentication & JWT — Starter Exercise
// Commented imports (would resolve in a real Angular project):
// import { Injectable, inject } from '@angular/core';
// import { HttpClient, HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { Observable, catchError, throwError } from 'rxjs';

// ─────────────────────────────────────────────
// Helper: decode JWT payload (no library needed)
// ─────────────────────────────────────────────

function decodeJwtPayload(token: string): { sub: string; exp: number } | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const decoded = atob(payloadBase64);
    return JSON.parse(decoded) as { sub: string; exp: number };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// TODO 1: Implement the AuthService methods below.
// ─────────────────────────────────────────────

// @Injectable({ providedIn: 'root' })
class AuthService {
  private readonly TOKEN_KEY = "auth_token";

  // TODO 1a: Implement login()
  // - Store the token in localStorage using TOKEN_KEY
  // - Accept a mock token string for now (no real HTTP needed)
  login(mockToken: string): void {
    // TODO: store the token
  }

  // TODO 1b: Implement logout()
  // - Remove the token from localStorage
  logout(): void {
    // TODO: remove the token
  }

  // TODO 1c: Implement getToken()
  // - Return the token from localStorage, or null if not present
  getToken(): string | null {
    // TODO: return token from storage
    return null;
  }

  // TODO 1d: Implement isLoggedIn()
  // - Return true if a token exists AND it is not expired
  // - Decode the token using decodeJwtPayload() above
  // - Compare payload.exp (seconds) with Date.now() / 1000
  isLoggedIn(): boolean {
    // TODO: check token existence and expiry
    return false;
  }
}

// ─────────────────────────────────────────────
// TODO 2: Complete the authInterceptor function.
// It should:
// - Get the token from AuthService
// - Clone the request and add Authorization: Bearer <token> header if token exists
// - Pass the (possibly modified) request to next()
// - Handle 401 errors by logging "Redirecting to login..."
// ─────────────────────────────────────────────

// const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//
//   const token = authService.getToken();
//
//   // TODO 2a: Clone the request with the Authorization header if token exists
//   const authReq = ???;
//
//   // TODO 2b: Pass authReq to next() and handle 401 errors
//   return next(authReq).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         // TODO 2c: call authService.logout() and log "Redirecting to login..."
//       }
//       return throwError(() => error);
//     })
//   );
// };

// ─────────────────────────────────────────────
// Verification helpers (plain TS — no Angular DI)
// ─────────────────────────────────────────────

// A valid-looking mock JWT (payload: { sub: 'test@example.com', exp: 9999999999 })
const MOCK_TOKEN_VALID =
  "eyJhbGciOiJIUzI1NiJ9." +
  btoa(JSON.stringify({ sub: "test@example.com", exp: 9999999999 })) +
  ".mock-sig";

// An expired mock JWT (exp: 1 — Unix epoch + 1 second)
const MOCK_TOKEN_EXPIRED =
  "eyJhbGciOiJIUzI1NiJ9." +
  btoa(JSON.stringify({ sub: "test@example.com", exp: 1 })) +
  ".mock-sig";

function verifyAuthService(): void {
  const auth = new AuthService();

  // Initially not logged in
  console.log("Initially not logged in:", !auth.isLoggedIn()); // true

  // After login with valid token
  auth.login(MOCK_TOKEN_VALID);
  console.log("Logged in after login():", auth.isLoggedIn()); // TODO: should be true
  console.log("getToken() returns token:", auth.getToken() !== null); // TODO: should be true

  // After logout
  auth.logout();
  console.log("Logged out after logout():", !auth.isLoggedIn()); // TODO: should be true

  // Expired token
  auth.login(MOCK_TOKEN_EXPIRED);
  console.log("Expired token = not logged in:", !auth.isLoggedIn()); // TODO: should be true
  auth.logout();
}

verifyAuthService();

export { AuthService, decodeJwtPayload };
export { MOCK_TOKEN_VALID, MOCK_TOKEN_EXPIRED };
